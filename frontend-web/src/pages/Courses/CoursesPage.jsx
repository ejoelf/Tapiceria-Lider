import SectionHeading from "../../components/common/SectionHeading";
import { courseList } from "../../data/siteData";
import "./CoursesPage.css";

function CoursesPage() {
  return (
    <div className="courses-page">
      <section className="courses-page__hero">
        <div className="container">
          <div className="courses-page__hero-box">
            <span>Cursos</span>
            <h1>Tapicería Líder también puede crecer como marca formadora</h1>
            <p>
              Los cursos suman valor comercial, posicionamiento, autoridad y una
              nueva línea de negocio para la empresa.
            </p>
          </div>
        </div>
      </section>

      <section className="courses-page__section">
        <div className="container">
          <SectionHeading
            eyebrow="Formación"
            title="Capacitaciones pensadas para profesionalizar el oficio"
            description="Esta página más adelante podrá conectarse al admin para gestionar fechas, cupos, precios y formularios."
          />

          <div className="courses-page__grid">
            {courseList.map((course) => (
              <article key={course.id} className="courses-page__card">
                <div className="courses-page__meta">
                  <span>{course.level}</span>
                  <span>{course.mode}</span>
                </div>

                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <strong>{course.duration}</strong>
                <button type="button">Consultar cupos</button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="courses-page__section">
        <div className="container">
          <div className="courses-page__banner">
            <div>
              <span>Potencial</span>
              <h2>Una nueva línea de negocio dentro de la misma marca</h2>
            </div>

            <p>
              Cursos, workshops y capacitaciones pueden convertir a Tapicería
              Líder en una marca de servicio + formación + autoridad en el rubro.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CoursesPage;