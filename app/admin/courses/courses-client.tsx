'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

interface AdminCourse {
  id: string;
  name: string;
  sceneCount: number;
  updatedAt: number;
  isOwner: boolean;
}

export function AdminCourses() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [error, setError] = useState('');
  const [copying, setCopying] = useState<string | null>(null);
  const loadCourses = useCallback(async () => {
    const response = await fetch('/api/stages', { cache: 'no-store' });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error ?? 'Could not load courses');
    setCourses(body.stages);
  }, []);

  useEffect(() => {
    void loadCourses().catch((caught: Error) => setError(caught.message));
  }, [loadCourses]);

  async function copyCourse(course: AdminCourse) {
    setCopying(course.id);
    setError('');
    try {
      const response = await fetch(`/api/stages/${encodeURIComponent(course.id)}/copy`, { method: 'POST' });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? 'Could not copy course');
      await loadCourses();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not copy course');
    } finally {
      setCopying(null);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-sm text-muted-foreground">Administration</p><h1 className="text-3xl font-semibold">All courses</h1></div>
        <div className="flex gap-3 text-sm"><Link className="rounded-lg border px-4 py-2 hover:bg-muted" href="/admin/users">Users</Link><Link className="rounded-lg border px-4 py-2 hover:bg-muted" href="/workspace">Workspace</Link></div>
      </div>
      <p className="mb-5 text-sm text-muted-foreground">Administrators can open and edit any course, or make a copy in their own library.</p>
      {error && <p role="alert" className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}
      <section className="overflow-hidden rounded-xl border bg-card">
        {courses.map((course) => (
          <article key={course.id} className="flex flex-wrap items-center justify-between gap-4 border-b px-5 py-4 last:border-b-0">
            <div className="min-w-0"><Link href={`/classroom/${encodeURIComponent(course.id)}`} className="truncate font-medium hover:underline">{course.name}</Link><p className="mt-1 text-xs text-muted-foreground">{course.sceneCount} pages · {course.isOwner ? 'Owned by you' : 'Shared by another user'}</p></div>
            <div className="flex shrink-0 gap-2"><Link className="rounded-md border px-3 py-2 text-sm hover:bg-muted" href={`/classroom/${encodeURIComponent(course.id)}`}>Open and edit</Link><button disabled={copying !== null} onClick={() => void copyCourse(course)} className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">{copying === course.id ? 'Copying…' : 'Copy'}</button></div>
          </article>
        ))}
        {courses.length === 0 && <p className="px-5 py-10 text-center text-sm text-muted-foreground">No courses found.</p>}
      </section>
    </main>
  );
}
