import sql from '../../../db';

export const dynamic = 'force-dynamic';

type ScoreRow = {
  course_id: string;
  component_id: string;
  score: string | number;
};

type SksRow = {
  course_id: string;
  sks: string | number;
};

type ProgressPayload = {
  scores?: Record<string, Record<string, number | ''>>;
  sks?: Record<string, number>;
};

export async function GET() {
  try {
    const savedScores = (await sql`
      select course_id, component_id, score
      from course_score_entries
    `) as ScoreRow[];

    const savedSks = (await sql`
      select course_id, sks
      from course_sks_entries
    `) as SksRow[];

    const scores: Record<string, Record<string, number>> = {};
    for (const row of savedScores) {
      if (!scores[row.course_id]) {
        scores[row.course_id] = {};
      }
      scores[row.course_id][row.component_id] = Number(row.score);
    }

    const sks: Record<string, number> = {};
    for (const row of savedSks) {
      sks[row.course_id] = Number(row.sks);
    }

    return Response.json({ scores, sks });
  } catch (error) {
    console.error('Failed to load saved progress from Neon:', error);
    return Response.json({ error: 'Failed to load saved progress.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as ProgressPayload;
    const scores = body.scores ?? {};
    const sks = body.sks ?? {};

    const scoreEntries = Object.entries(scores).flatMap(([courseId, components]) =>
      Object.entries(components).map(([componentId, value]) => ({ courseId, componentId, value })),
    );

    await Promise.all(
      scoreEntries.map(async ({ courseId, componentId, value }) => {
        if (value === '') {
          await sql`
            delete from course_score_entries
            where course_id = ${courseId} and component_id = ${componentId}
          `;
          return;
        }

        await sql`
          insert into course_score_entries (course_id, component_id, score, updated_at)
          values (${courseId}, ${componentId}, ${value}, now())
          on conflict (course_id, component_id)
          do update set score = excluded.score, updated_at = now()
        `;
      }),
    );

    await Promise.all(
      Object.entries(sks).map(async ([courseId, value]) => {
        await sql`
          insert into course_sks_entries (course_id, sks, updated_at)
          values (${courseId}, ${value}, now())
          on conflict (course_id)
          do update set sks = excluded.sks, updated_at = now()
        `;
      }),
    );

    return Response.json({ ok: true });
  } catch (error) {
    console.error('Failed to save progress to Neon:', error);
    return Response.json({ error: 'Failed to save progress.' }, { status: 500 });
  }
}