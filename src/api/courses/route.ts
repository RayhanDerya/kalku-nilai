import sql from '../../db';

export const dynamic = 'force-dynamic';

type CourseRow = {
  id: string;
  name: string;
  default_sks: number;
};

type CourseComponentRow = {
  course_id: string;
  component_id: string;
  label: string;
  weight: string | number;
};

export async function GET() {
  try {
    const courses = (await sql`
      select id, name, default_sks
      from courses
      order by id
    `) as CourseRow[];

    const components = (await sql`
      select course_id, component_id, label, weight
      from course_components
      order by course_id, id
    `) as CourseComponentRow[];

    const payload = courses.map((course) => ({
      id: course.id,
      name: course.name,
      defaultSks: Number(course.default_sks),
      components: components
        .filter((component) => component.course_id === course.id)
        .map((component) => ({
          id: component.component_id,
          label: component.label,
          weight: Number(component.weight),
        })),
    }));

    return Response.json(payload);
  } catch (error) {
    console.error('Failed to load courses from Neon:', error);
    return Response.json({ error: 'Failed to load courses.' }, { status: 500 });
  }
}