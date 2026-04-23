import path from "path";
import { User, WorkOrder, WorkOrderMedia } from "../../database/models/index.js";
import AppError from "../../utils/appError.js";
import { buildPublicFileUrl, normalizeSlashes } from "../../utils/fileStorage.js";

const mediaInclude = [{ model: User, as: "uploaded_by_user" }];

function validateMediaType(mediaType) {
  const allowed = ["image", "video", "file", "external_link"];
  if (!allowed.includes(mediaType)) {
    throw new AppError("media_type debe ser image, video, file o external_link.", 400);
  }
}

function validateStage(stage) {
  const allowed = ["before", "during", "after", "cover", "other"];
  if (!allowed.includes(stage)) {
    throw new AppError("stage debe ser before, during, after, cover u other.", 400);
  }
}

function inferMediaTypeFromMime(mimeType = "") {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "file";
}

export async function listMediaByWorkOrder(workOrderId) {
  const workOrder = await WorkOrder.findByPk(workOrderId);
  if (!workOrder) {
    throw new AppError("Orden de trabajo no encontrada.", 404);
  }

  const items = await WorkOrderMedia.findAll({
    where: { work_order_id: workOrderId },
    include: mediaInclude,
    order: [["sort_order", "ASC"], ["id", "ASC"]],
  });

  return items.map((item) => item.toSafeJSON());
}

export async function createMediaRecord(workOrderId, payload, authUserId = null) {
  const workOrder = await WorkOrder.findByPk(workOrderId);
  if (!workOrder) {
    throw new AppError("Orden de trabajo no encontrada.", 404);
  }

  const {
    media_type,
    stage = "other",
    title = null,
    description = null,
    storage_type = "local",
    file_name = null,
    original_name = null,
    mime_type = null,
    file_size = null,
    file_path = null,
    file_url = null,
    external_url = null,
    thumbnail_url = null,
    sort_order = 0,
    is_cover = false,
    is_public_portfolio_asset = false,
    is_active = true,
    metadata = null,
  } = payload;

  if (!media_type) {
    throw new AppError("media_type es obligatorio.", 400);
  }

  validateMediaType(media_type);
  validateStage(stage);

  if (media_type === "external_link" && !external_url) {
    throw new AppError("Para media_type external_link debés indicar external_url.", 400);
  }

  if (is_cover) {
    await WorkOrderMedia.update(
      { is_cover: false },
      { where: { work_order_id: workOrderId } }
    );
  }

  const media = await WorkOrderMedia.create({
    work_order_id: workOrderId,
    uploaded_by_user_id: authUserId,
    media_type,
    stage,
    title: title ? String(title).trim() : null,
    description: description ? String(description).trim() : null,
    storage_type: storage_type ? String(storage_type).trim() : "local",
    file_name: file_name ? String(file_name).trim() : null,
    original_name: original_name ? String(original_name).trim() : null,
    mime_type: mime_type ? String(mime_type).trim() : null,
    file_size,
    file_path: file_path ? normalizeSlashes(String(file_path).trim()) : null,
    file_url: file_url ? String(file_url).trim() : null,
    external_url: external_url ? String(external_url).trim() : null,
    thumbnail_url: thumbnail_url ? String(thumbnail_url).trim() : null,
    sort_order,
    is_cover: Boolean(is_cover),
    is_public_portfolio_asset: Boolean(is_public_portfolio_asset),
    is_active: Boolean(is_active),
    metadata,
  });

  const created = await WorkOrderMedia.findByPk(media.id, {
    include: mediaInclude,
  });

  return created.toSafeJSON();
}

export async function createUploadedMediaRecord(workOrderId, file, body, req, authUserId = null) {
  const workOrder = await WorkOrder.findByPk(workOrderId);
  if (!workOrder) {
    throw new AppError("Orden de trabajo no encontrada.", 404);
  }

  if (!file) {
    throw new AppError("No se recibió ningún archivo.", 400);
  }

  const stage = body.stage || "other";
  validateStage(stage);

  const mediaType = body.media_type || inferMediaTypeFromMime(file.mimetype);
  validateMediaType(mediaType);

  const relativeFilePath = normalizeSlashes(
    path.join("uploads", "work-orders", String(workOrderId), file.filename)
  );

  const fileUrl = buildPublicFileUrl(req, relativeFilePath);

  if (body.is_cover === "true" || body.is_cover === true) {
    await WorkOrderMedia.update(
      { is_cover: false },
      { where: { work_order_id: workOrderId } }
    );
  }

  const media = await WorkOrderMedia.create({
    work_order_id: workOrderId,
    uploaded_by_user_id: authUserId,
    media_type: mediaType,
    stage,
    title: body.title ? String(body.title).trim() : file.originalname,
    description: body.description ? String(body.description).trim() : null,
    storage_type: "local",
    file_name: file.filename,
    original_name: file.originalname,
    mime_type: file.mimetype,
    file_size: file.size,
    file_path: relativeFilePath,
    file_url: fileUrl,
    external_url: null,
    thumbnail_url: null,
    sort_order: body.sort_order ? Number(body.sort_order) : 0,
    is_cover: body.is_cover === "true" || body.is_cover === true,
    is_public_portfolio_asset:
      body.is_public_portfolio_asset === "true" ||
      body.is_public_portfolio_asset === true,
    is_active: true,
    metadata: {
      uploaded_via: "multer",
    },
  });

  const created = await WorkOrderMedia.findByPk(media.id, {
    include: mediaInclude,
  });

  return created.toSafeJSON();
}

export async function updateMediaRecord(mediaId, payload) {
  const media = await WorkOrderMedia.findByPk(mediaId);

  if (!media) {
    throw new AppError("Media no encontrada.", 404);
  }

  const {
    media_type,
    stage,
    title,
    description,
    storage_type,
    file_name,
    original_name,
    mime_type,
    file_size,
    file_path,
    file_url,
    external_url,
    thumbnail_url,
    sort_order,
    is_cover,
    is_public_portfolio_asset,
    is_active,
    metadata,
  } = payload;

  if (media_type !== undefined) {
    validateMediaType(media_type);
    media.media_type = media_type;
  }

  if (stage !== undefined) {
    validateStage(stage);
    media.stage = stage;
  }

  if (title !== undefined) media.title = title ? String(title).trim() : null;
  if (description !== undefined) media.description = description ? String(description).trim() : null;
  if (storage_type !== undefined) media.storage_type = storage_type ? String(storage_type).trim() : "local";
  if (file_name !== undefined) media.file_name = file_name ? String(file_name).trim() : null;
  if (original_name !== undefined) media.original_name = original_name ? String(original_name).trim() : null;
  if (mime_type !== undefined) media.mime_type = mime_type ? String(mime_type).trim() : null;
  if (file_size !== undefined) media.file_size = file_size;
  if (file_path !== undefined) media.file_path = file_path ? normalizeSlashes(String(file_path).trim()) : null;
  if (file_url !== undefined) media.file_url = file_url ? String(file_url).trim() : null;
  if (external_url !== undefined) media.external_url = external_url ? String(external_url).trim() : null;
  if (thumbnail_url !== undefined) media.thumbnail_url = thumbnail_url ? String(thumbnail_url).trim() : null;
  if (sort_order !== undefined) media.sort_order = sort_order;
  if (is_public_portfolio_asset !== undefined) {
    media.is_public_portfolio_asset = Boolean(is_public_portfolio_asset);
  }
  if (is_active !== undefined) media.is_active = Boolean(is_active);
  if (metadata !== undefined) media.metadata = metadata;

  if (is_cover !== undefined) {
    if (Boolean(is_cover)) {
      await WorkOrderMedia.update(
        { is_cover: false },
        { where: { work_order_id: media.work_order_id } }
      );
      media.is_cover = true;
    } else {
      media.is_cover = false;
    }
  }

  if (media.media_type === "external_link" && !media.external_url) {
    throw new AppError("Para media_type external_link debés indicar external_url.", 400);
  }

  await media.save();

  const updated = await WorkOrderMedia.findByPk(media.id, {
    include: mediaInclude,
  });

  return updated.toSafeJSON();
}

export async function deleteMediaRecord(mediaId) {
  const media = await WorkOrderMedia.findByPk(mediaId);

  if (!media) {
    throw new AppError("Media no encontrada.", 404);
  }

  media.is_active = false;
  await media.save();

  return {
    success: true,
  };
}