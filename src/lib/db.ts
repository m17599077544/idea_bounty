import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'ideabounty.db');

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS ideas (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      implementation TEXT NOT NULL DEFAULT '',
      category TEXT,
      submitter_name TEXT NOT NULL DEFAULT '匿名用户',
      originality TEXT NOT NULL DEFAULT 'fresh',
      duplicate_of_id TEXT,
      similarity_score REAL,
      need_breadth INTEGER NOT NULL DEFAULT 0,
      pay_willingness INTEGER NOT NULL DEFAULT 0,
      feasibility INTEGER NOT NULL DEFAULT 0,
      basic_bounty REAL NOT NULL DEFAULT 0,
      boss_level INTEGER NOT NULL DEFAULT 0,
      boss_reasoning TEXT NOT NULL DEFAULT '',
      bounty_amount REAL NOT NULL DEFAULT 0,
      ai_reasoning TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending_review',
      embedding TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
  `);
}

export interface IdeaRow {
  id: string;
  title: string;
  description: string;
  implementation: string;
  category: string | null;
  submitter_name: string;
  originality: 'fresh' | 'duplicate' | 'suspected_duplicate';
  duplicate_of_id: string | null;
  similarity_score: number | null;
  need_breadth: number;
  pay_willingness: number;
  feasibility: number;
  basic_bounty: number;
  boss_level: number;
  boss_reasoning: string;
  bounty_amount: number;
  ai_reasoning: string;
  status: 'pending_review' | 'approved' | 'adjusted' | 'rejected';
  embedding: string;
  created_at: string;
  updated_at: string;
}

export interface CreateIdeaInput {
  id: string;
  title: string;
  description: string;
  implementation?: string;
  category?: string | null;
  submitter_name: string;
  originality: string;
  duplicate_of_id?: string | null;
  similarity_score?: number | null;
  need_breadth: number;
  pay_willingness: number;
  feasibility: number;
  basic_bounty: number;
  boss_level: number;
  boss_reasoning: string;
  bounty_amount: number;
  ai_reasoning: string;
  embedding: string;
}

export function createIdea(input: CreateIdeaInput): IdeaRow {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO ideas (id, title, description, implementation, category, submitter_name, originality,
      duplicate_of_id, similarity_score, need_breadth, pay_willingness, feasibility,
      basic_bounty, boss_level, boss_reasoning, bounty_amount, ai_reasoning, status, embedding)
    VALUES (@id, @title, @description, @implementation, @category, @submitter_name, @originality,
      @duplicate_of_id, @similarity_score, @need_breadth, @pay_willingness, @feasibility,
      @basic_bounty, @boss_level, @boss_reasoning, @bounty_amount, @ai_reasoning, 'pending_review', @embedding)
  `);
  stmt.run(input);
  return getIdeaById(input.id)!;
}

export function getIdeaById(id: string): IdeaRow | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM ideas WHERE id = ?').get(id) as IdeaRow | undefined;
}

export function getAllIdeas(): IdeaRow[] {
  const db = getDb();
  return db.prepare('SELECT * FROM ideas ORDER BY created_at DESC').all() as IdeaRow[];
}

export function getAllIdeasWithEmbeddings(): Pick<IdeaRow, 'id' | 'embedding' | 'title'>[] {
  const db = getDb();
  return db.prepare('SELECT id, embedding, title FROM ideas').all() as Pick<IdeaRow, 'id' | 'embedding' | 'title'>[];
}

export function updateIdeaBounty(id: string, bountyAmount: number, status: string): void {
  const db = getDb();
  db.prepare(`
    UPDATE ideas SET bounty_amount = @bountyAmount, status = @status,
    updated_at = datetime('now', 'localtime') WHERE id = @id
  `).run({ id, bountyAmount, status });
}

export function getStats() {
  const db = getDb();
  const total = db.prepare('SELECT COUNT(*) as count FROM ideas').get() as { count: number };
  const totalBounty = db.prepare('SELECT SUM(bounty_amount) as sum FROM ideas').get() as { sum: number };
  const freshCount = db.prepare("SELECT COUNT(*) as count FROM ideas WHERE originality = 'fresh'").get() as { count: number };
  const duplicateCount = db.prepare("SELECT COUNT(*) as count FROM ideas WHERE originality = 'duplicate'").get() as { count: number };
  const pendingCount = db.prepare("SELECT COUNT(*) as count FROM ideas WHERE status = 'pending_review'").get() as { count: number };
  const bossCount = db.prepare('SELECT COUNT(*) as count FROM ideas WHERE boss_level > 0').get() as { count: number };
  const avgScore = db.prepare(`
    SELECT AVG(need_breadth * 0.4 + pay_willingness * 0.35 + feasibility * 0.25) as avg FROM ideas
  `).get() as { avg: number };

  return {
    totalSubmissions: total.count,
    totalBounty: totalBounty.sum || 0,
    freshCount: freshCount.count,
    duplicateCount: duplicateCount.count,
    pendingReview: pendingCount.count,
    bossCount: bossCount.count,
    averageScore: Math.round((avgScore.avg || 0) * 100) / 100,
  };
}

export { getDb };
