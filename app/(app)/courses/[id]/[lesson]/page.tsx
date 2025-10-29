import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { Heading, Body, Muted } from "@/components/ui/typography";
import { Stack } from "@/components/ui/spacing";
import { getLessonWithSections } from "@/src/db/queries/lessons";
import { completeSectionAction, checkSectionCompletion } from "../../_lib/actions";
import { WhyItMatters } from "../../_components/why-it-matters";

interface LessonPageProps {
  params: Promise<{ id: string; lesson: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LessonPage({ params, searchParams }: LessonPageProps) {
  const { id, lesson } = await params;
  const sp = (await (searchParams || Promise.resolve({}))) as Record<string, string | string[] | undefined>;

  const lessonSlug = `${id}-1-introduction`;
  if (lesson !== lessonSlug) {
    // For now, only support the first lesson route; others can be added similarly
    notFound();
  }

  const rows = await getLessonWithSections.execute({ lessonSlug });
  if (!rows || rows.length === 0) {
    notFound();
  }

  const lessonMeta = {
    id: rows[0].id,
    slug: rows[0].slug,
    title: rows[0].title,
    description: rows[0].description,
  };

  const sections = rows
    .filter(r => r.sectionId)
    .map(r => ({
      id: r.sectionId as number,
      slug: r.sectionSlug as string,
      title: r.sectionTitle as string,
      order: r.sectionOrder as number,
      body: r.sectionBody as string,
    }))
    .sort((a, b) => a.order - b.order);

  // Check if the "why-it-matters" section is already completed
  const whyItMattersSection = sections.find(s => s.slug === 'why-it-matters');
  const isWhyItMattersCompleted = whyItMattersSection 
    ? (await checkSectionCompletion({ lessonSlug, sectionSlug: 'why-it-matters' })).isCompleted
    : false;

  async function completeSection(formData: FormData) {
    'use server';
    const sectionSlug = formData.get('sectionSlug') as string;
    const result = await completeSectionAction({ lessonSlug, sectionSlug });
    if (result?.lessonCompleted) {
      // Redirect back to refresh state silently without XP params
      redirect(`/courses/${id}/${lesson}`);
    }
  }

  return (
    <div 
      className="min-h-dvh"
      style={{
        color: '#e8e8e8',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        minHeight: '100vh',
        position: 'relative',
        background: 'linear-gradient(-45deg, #1a1a2e, #16213e, #0f3460, #1a1a2e)',
        backgroundSize: '400% 400%'
      }}
    >
      <main className="mx-auto max-w-5xl px-4 pt-6 pb-16 relative z-10">
        <Stack gap="loose">
          {/* XP banners removed for simplicity */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link 
              href={`/courses/${id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#e8e8e8',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textDecoration: 'none',
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Course
            </Link>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              borderRadius: '10px',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}>
              <CheckCircle className="h-4 w-4" />
              Lesson Complete - Revisiting
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            padding: '24px',
          }}>
            <Stack gap="default">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Heading level={2} style={{color: '#ffffff', fontWeight: 600}}>{lessonMeta.title}</Heading>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  fontSize: '12px',
                  fontWeight: '500',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981',
                  borderRadius: '6px',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                }}>
                  <CheckCircle className="h-3 w-3" />
                  Completed
                </div>
              </div>
              <Body style={{color: '#94a3b8'}}>{lessonMeta.description}</Body>
            </Stack>
          </div>

          {/* Why it matters - Flip Cards with gated submit */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <Stack gap="default">
              <Heading level={4} style={{color: '#ffffff', fontWeight: 600}}>Why it matters</Heading>
              <form id="why-submit" action={completeSection}>
                <input type="hidden" name="sectionSlug" value="why-it-matters" />
              </form>
              <WhyItMatters
                submitFormId="why-submit"
                isCompleted={isWhyItMattersCompleted}
                cards={[
                  { front: 'Computational Thinking', back: 'Break problems into steps and patterns—transferable to any field.' },
                  { front: 'Career Opportunities', back: 'Programming skills open doors in every industry.' },
                  { front: 'Automation', back: 'Automate repetitive tasks and build tools that save time.' },
                ]}
              />
            </Stack>
          </div>

          {/* Reading Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <Stack gap="default">
              <Heading level={4} style={{color: '#ffffff', fontWeight: 600}}>Read: What is Programming?</Heading>
              <Body style={{color:'#e8e8e8'}}>
                Programming is the art and science of giving precise instructions to a computer so it can perform tasks.
                At its core, programming is about problem-solving: understanding a problem, designing a solution, and expressing that
                solution as a series of steps (an algorithm) that a computer can execute.
              </Body>
              <Body style={{color:'#e8e8e8'}}>
                An algorithm is a finite, ordered list of unambiguous instructions that transforms input into output. Good algorithms
                are correct, efficient, and easy to reason about. You can implement the same algorithm in many languages; the concepts
                remain the same.
              </Body>
              <form action={completeSection}>
                <input type="hidden" name="sectionSlug" value="what-is-programming" />
                <button style={{
                  display: 'inline-flex', alignItems:'center', gap: 8,
                  padding: '10px 16px', borderRadius: 8,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color:'#fff',
                  border: 'none', fontWeight: 600
                }}>
                  Mark as Read
                </button>
              </form>
            </Stack>
          </div>

          {/* Pulse Check */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <Stack gap="default">
              <Heading level={4} style={{color:'#ffffff', fontWeight:600}}>Pulse Check</Heading>
              <Body style={{color:'#94a3b8'}}>Quick question to confirm understanding.</Body>
              <form action={completeSection}>
                <input type="hidden" name="sectionSlug" value="your-first-program" />
                <fieldset style={{display:'grid', gap:12}}>
                  <legend style={{color:'#e8e8e8', marginBottom:8}}>Which statement best defines an algorithm?</legend>
                  <label style={{display:'flex', alignItems:'center', gap:8, color:'#e8e8e8'}}>
                    <input type="radio" name="answer" value="a" /> A list of precise steps to solve a problem
                  </label>
                  <label style={{display:'flex', alignItems:'center', gap:8, color:'#e8e8e8'}}>
                    <input type="radio" name="answer" value="b" /> Any code that compiles
                  </label>
                  <label style={{display:'flex', alignItems:'center', gap:8, color:'#e8e8e8'}}>
                    <input type="radio" name="answer" value="c" /> A programming language
                  </label>
                </fieldset>
                <div style={{display:'flex', gap:12, marginTop:12}}>
                  <button style={{
                    display:'inline-flex', alignItems:'center', gap:8,
                    padding:'10px 16px', borderRadius:8,
                    background:'linear-gradient(135deg, #10b981 0%, #059669 100%)', color:'#fff', border:'none', fontWeight:600
                  }}>Submit</button>
                  <span style={{color:'#94a3b8'}}>Correct answer: &ldquo;A list of precise steps...&rdquo;</span>
                </div>
              </form>
            </Stack>
          </div>

          {/* Drag to order - Algorithms */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <Stack gap="default">
              <Heading level={4} style={{color:'#ffffff', fontWeight:600}}>Arrange the algorithm steps</Heading>
              <Body style={{color:'#94a3b8'}}>Drag to order the steps of making tea (an algorithm example):</Body>
              <ol style={{listStyle:'none', padding:0, margin:0, display:'grid', gap:8}}>
                {['Boil water','Place tea bag in cup','Pour hot water','Steep and remove bag','Enjoy'].map((step, i) => (
                  <li key={i} draggable style={{
                    padding:'10px 12px', borderRadius:8,
                    background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.15)', color:'#e8e8e8'
                  }}>{step}</li>
                ))}
              </ol>
              <form action={completeSection}>
                <input type="hidden" name="sectionSlug" value="programming-languages" />
                <button style={{
                  display:'inline-flex', alignItems:'center', gap:8,
                  padding:'10px 16px', borderRadius:8,
                  background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color:'#fff', border:'none', fontWeight:600
                }}>Save Order</button>
              </form>
            </Stack>
          </div>

        </Stack>
      </main>
    </div>
  );
}


