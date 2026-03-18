import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  if (secret !== process.env.REVALIDATION_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    // Upsert professions
    const [hr, teachers, , , , ,] = await Promise.all([
      prisma.profession.upsert({
        where: { slug: 'hr' },
        update: {},
        create: {
          slug: 'hr',
          name: 'HR Professionals',
          description: 'AI tools for human resources teams to streamline hiring, onboarding, and employee management.',
          iconKey: 'users',
          sortOrder: 1,
          isActive: true,
          seoTitle: 'AI Tools for HR Professionals | PromptDesk',
          seoDesc: 'Free AI-powered tools for HR teams. Generate job descriptions, interview questions, performance reviews, and more.',
        },
      }),
      prisma.profession.upsert({
        where: { slug: 'teachers' },
        update: {},
        create: {
          slug: 'teachers',
          name: 'Teachers & Educators',
          description: 'AI tools for educators to create lesson plans, assessments, and engaging educational content.',
          iconKey: 'graduation-cap',
          sortOrder: 2,
          isActive: true,
          seoTitle: 'AI Tools for Teachers & Educators | PromptDesk',
          seoDesc: 'Free AI-powered tools for teachers. Create lesson plans, quizzes, rubrics, and classroom materials in minutes.',
        },
      }),
      prisma.profession.upsert({
        where: { slug: 'marketers' },
        update: {},
        create: {
          slug: 'marketers',
          name: 'Marketers',
          description: 'AI tools for marketing professionals to create compelling copy, campaigns, and content strategies.',
          iconKey: 'megaphone',
          sortOrder: 3,
          isActive: true,
          seoTitle: 'AI Tools for Marketers | PromptDesk',
          seoDesc: 'Free AI-powered marketing tools. Generate ad copy, email campaigns, social posts, and marketing content instantly.',
        },
      }),
      prisma.profession.upsert({
        where: { slug: 'sales' },
        update: {},
        create: {
          slug: 'sales',
          name: 'Sales Professionals',
          description: 'AI tools for sales teams to craft compelling outreach, proposals, and follow-up communications.',
          iconKey: 'trending-up',
          sortOrder: 4,
          isActive: true,
          seoTitle: 'AI Tools for Sales Professionals | PromptDesk',
          seoDesc: 'Free AI-powered sales tools. Write cold emails, proposals, follow-ups, and sales copy that converts.',
        },
      }),
      prisma.profession.upsert({
        where: { slug: 'recruiters' },
        update: {},
        create: {
          slug: 'recruiters',
          name: 'Recruiters',
          description: 'AI tools for recruiters to source candidates, write outreach, and streamline the hiring process.',
          iconKey: 'search',
          sortOrder: 5,
          isActive: true,
          seoTitle: 'AI Tools for Recruiters | PromptDesk',
          seoDesc: 'Free AI-powered recruiting tools. Write job posts, candidate outreach, interview guides, and offer letters.',
        },
      }),
      prisma.profession.upsert({
        where: { slug: 'freelancers' },
        update: {},
        create: {
          slug: 'freelancers',
          name: 'Freelancers',
          description: 'AI tools for freelancers to win clients, deliver work faster, and grow their business.',
          iconKey: 'laptop',
          sortOrder: 6,
          isActive: true,
          seoTitle: 'AI Tools for Freelancers | PromptDesk',
          seoDesc: 'Free AI-powered freelancer tools. Write proposals, client emails, project briefs, and invoices with AI.',
        },
      }),
    ])

    const sales = await prisma.profession.findUnique({ where: { slug: 'sales' } })

    // Upsert tasks
    const writeJobDescTask = await prisma.task.upsert({
      where: { slug: 'write-job-description' },
      update: {},
      create: {
        slug: 'write-job-description',
        name: 'Write a Job Description',
        description: 'Create compelling, accurate job descriptions that attract top talent and clearly communicate role expectations.',
        status: 'LIVE',
        seoTitle: 'How to Write a Job Description with AI | PromptDesk',
        seoDesc: 'Use AI to write professional job descriptions in minutes. Free tools and templates for HR teams.',
      },
    })
    const writeColdEmailTask = await prisma.task.upsert({
      where: { slug: 'write-cold-email' },
      update: {},
      create: {
        slug: 'write-cold-email',
        name: 'Write a Cold Email',
        description: 'Craft personalized, high-converting cold emails that get opened, read, and replied to.',
        status: 'LIVE',
        seoTitle: 'How to Write a Cold Email with AI | PromptDesk',
        seoDesc: 'Use AI to write cold emails that get responses. Free cold email generator for sales professionals.',
      },
    })
    const createLessonPlanTask = await prisma.task.upsert({
      where: { slug: 'create-lesson-plan' },
      update: {},
      create: {
        slug: 'create-lesson-plan',
        name: 'Create a Lesson Plan',
        description: 'Design structured, engaging lesson plans aligned with learning objectives and curriculum standards.',
        status: 'LIVE',
        seoTitle: 'How to Create a Lesson Plan with AI | PromptDesk',
        seoDesc: 'Use AI to create detailed lesson plans in minutes. Free lesson plan generator for teachers.',
      },
    })

    // Link tasks to professions
    await Promise.all([
      prisma.taskProfession.upsert({
        where: { taskId_professionId: { taskId: writeJobDescTask.id, professionId: hr.id } },
        update: {},
        create: { taskId: writeJobDescTask.id, professionId: hr.id, sortOrder: 1 },
      }),
      prisma.taskProfession.upsert({
        where: { taskId_professionId: { taskId: writeColdEmailTask.id, professionId: sales!.id } },
        update: {},
        create: { taskId: writeColdEmailTask.id, professionId: sales!.id, sortOrder: 1 },
      }),
      prisma.taskProfession.upsert({
        where: { taskId_professionId: { taskId: createLessonPlanTask.id, professionId: teachers.id } },
        update: {},
        create: { taskId: createLessonPlanTask.id, professionId: teachers.id, sortOrder: 1 },
      }),
    ])

    // Tool 1: Job Description Generator
    const jobDescTool = await prisma.tool.upsert({
      where: { slug: 'job-description-generator' },
      update: {},
      create: {
        slug: 'job-description-generator',
        name: 'Job Description Generator',
        shortDesc: 'Create compelling, professional job descriptions that attract top candidates in minutes.',
        status: 'LIVE',
        blueprint: 'text-generator',
        aiOutputEnabled: true,
        publishedAt: new Date(),
        fieldsSchema: [
          { key: 'job_title', type: 'text', label: 'Job Title', placeholder: 'e.g. Senior Product Manager', required: true },
          { key: 'company_name', type: 'text', label: 'Company Name', placeholder: 'e.g. Acme Corp', required: true },
          { key: 'seniority', type: 'select', label: 'Seniority Level', required: true, options: [{ value: 'Junior', label: 'Junior' }, { value: 'Mid', label: 'Mid-Level' }, { value: 'Senior', label: 'Senior' }, { value: 'Lead', label: 'Lead' }, { value: 'Director', label: 'Director' }, { value: 'VP', label: 'VP' }] },
          { key: 'tone', type: 'select', label: 'Writing Tone', required: true, options: [{ value: 'professional', label: 'Professional' }, { value: 'friendly', label: 'Friendly & Approachable' }, { value: 'formal', label: 'Formal' }, { value: 'startup', label: 'Startup / Casual' }] },
          { key: 'key_responsibilities', type: 'textarea', label: 'Key Responsibilities', placeholder: 'List the main responsibilities for this role...', required: true },
          { key: 'requirements', type: 'textarea', label: 'Requirements & Qualifications', placeholder: 'List required skills, experience, and education...', required: true },
        ],
        promptTemplate: `Write a professional job description for a {{seniority}} {{job_title}} at {{company_name}}.\n\nTone: {{tone}}\n\nKey Responsibilities:\n{{key_responsibilities}}\n\nRequirements & Qualifications:\n{{requirements}}\n\nFormat the job description with:\n1. A compelling introduction about the company and role\n2. A "What You'll Do" section with the key responsibilities formatted as bullet points\n3. A "What We're Looking For" section with requirements as bullet points\n4. A brief "Why Join Us" section\n5. An equal opportunity employer statement\n\nKeep it engaging, specific, and professional. Avoid generic filler phrases.`,
        promptLibrary: [
          { id: 'jd-prompt-1', useCase: 'Standard Job Description', prompt: 'Write a complete job description for a [Job Title] at [Company]. Include: role overview, key responsibilities (8-10 bullet points), required qualifications, preferred qualifications, and benefits. Tone: [professional/friendly/startup]. Seniority: [Junior/Mid/Senior/Lead].', platform: 'any', tags: ['hiring', 'HR', 'job posting'] },
          { id: 'jd-prompt-2', useCase: 'Remote-First Job Description', prompt: 'Create a remote-first job description for a [Job Title] position. Emphasize remote work culture, async communication, and distributed team dynamics. Include: role summary, responsibilities, requirements, and remote work setup expectations. Company: [Company Name].', platform: 'claude', tags: ['remote', 'hiring', 'distributed team'] },
          { id: 'jd-prompt-3', useCase: 'Diversity-Focused Job Posting', prompt: 'Write an inclusive job description for a [Job Title] role that attracts diverse candidates. Use gender-neutral language, focus on skills over credentials, and include a genuine DEI commitment statement. Responsibilities: [list responsibilities]. Requirements: [list requirements].', platform: 'chatgpt', tags: ['DEI', 'inclusive hiring', 'diversity'] },
        ],
        guideContent: [
          { type: 'intro', heading: 'How to Write a Job Description That Attracts Top Talent', body: 'A well-crafted job description is the foundation of successful hiring. It attracts qualified candidates, sets clear expectations, and reflects your company culture. This guide will show you how to use AI to create compelling job descriptions in minutes.' },
          { type: 'section', heading: 'The 5 Essential Elements of a Great Job Description', body: 'Every effective job description contains five core components that work together to attract the right candidates and filter out poor fits.', items: ['Compelling job title that matches industry standards and search terms', 'Clear role overview explaining why this position exists', 'Specific responsibilities that paint a picture of day-to-day work', 'Honest requirements that distinguish must-haves from nice-to-haves', 'Company culture and benefits that make candidates want to apply'] },
          { type: 'steps', heading: 'Step-by-Step: Using the Job Description Generator', items: ['Enter the job title exactly as it will appear in the posting', 'Select the appropriate seniority level to calibrate expectations', 'Choose a tone that matches your company culture', 'List 5-8 specific responsibilities using action verbs', 'Add requirements separating must-haves from preferred qualifications', 'Click Generate to create your AI-powered job description', 'Review, customize, and post to your preferred job boards'] },
          { type: 'callout', variant: 'tip', heading: 'Pro Tip: Be Specific About Responsibilities', content: 'Vague job descriptions attract unqualified applicants. Instead of "manage projects," write "lead cross-functional product launches from ideation to post-launch analysis." Specificity saves you time screening and attracts candidates who truly understand the role.' },
        ],
        faq: [
          { id: 'jd-faq-1', question: 'How long should a job description be?', answer: 'The ideal job description is 400-700 words. Long enough to give candidates a clear picture of the role, but short enough to hold attention. Focus on quality over quantity — every sentence should either inform or excite the candidate.' },
          { id: 'jd-faq-2', question: 'Should I list salary in the job description?', answer: 'Yes, when possible. Listings with salary ranges receive up to 30% more applications and attract better-matched candidates. Most candidates will research salary anyway, so transparency saves everyone time. Many states now require salary disclosure by law.' },
          { id: 'jd-faq-3', question: 'How do I make my job description stand out?', answer: 'Avoid generic phrases like "fast-paced environment" or "team player." Instead, describe what makes your company genuinely different, what the person will actually accomplish in the first 90 days, and why top performers choose to work there. Authenticity attracts the right talent.' },
        ],
        seoToolTitle: 'Free Job Description Generator | AI-Powered | PromptDesk',
        seoToolDesc: 'Generate professional job descriptions in seconds with AI. Free tool for HR teams. Customize tone, seniority, and responsibilities.',
        seoPromptTitle: 'Best AI Prompts for Writing Job Descriptions (Copy-Paste) | PromptDesk',
        seoPromptDesc: 'Copy-paste AI prompts for writing job descriptions. Works with ChatGPT, Claude, and Gemini. Free for HR professionals.',
        seoGuideTitle: 'How to Write a Job Description: Complete Guide | PromptDesk',
        seoGuideDesc: 'Step-by-step guide to writing job descriptions that attract top talent. Includes AI tools, templates, and expert tips.',
        relatedSlugs: ['cold-email-generator', 'lesson-plan-generator'],
      },
    })

    await Promise.all([
      prisma.toolProfession.upsert({
        where: { toolId_professionId: { toolId: jobDescTool.id, professionId: hr.id } },
        update: {},
        create: { toolId: jobDescTool.id, professionId: hr.id, isPrimary: true, sortOrder: 1 },
      }),
      prisma.taskTool.upsert({
        where: { taskId_toolId: { taskId: writeJobDescTask.id, toolId: jobDescTool.id } },
        update: {},
        create: { taskId: writeJobDescTask.id, toolId: jobDescTool.id, isPrimary: true, sortOrder: 1 },
      }),
    ])

    // Tool 2: Cold Email Generator
    const coldEmailTool = await prisma.tool.upsert({
      where: { slug: 'cold-email-generator' },
      update: {},
      create: {
        slug: 'cold-email-generator',
        name: 'Cold Email Generator',
        shortDesc: 'Write personalized cold emails that get opened and replied to. Powered by AI.',
        status: 'LIVE',
        blueprint: 'email-composer',
        aiOutputEnabled: true,
        publishedAt: new Date(),
        fieldsSchema: [
          { key: 'recipient_role', type: 'text', label: "Recipient's Job Title", placeholder: 'e.g. Head of Marketing', required: true },
          { key: 'recipient_company', type: 'text', label: "Recipient's Company", placeholder: 'e.g. Shopify', required: true },
          { key: 'your_product', type: 'text', label: 'Your Product/Service', placeholder: 'e.g. AI analytics platform for e-commerce', required: true },
          { key: 'pain_point', type: 'text', label: 'Pain Point You Solve', placeholder: 'e.g. losing customers due to poor product recommendations', required: true },
          { key: 'tone', type: 'select', label: 'Email Tone', required: true, options: [{ value: 'professional', label: 'Professional' }, { value: 'casual', label: 'Casual & Friendly' }, { value: 'direct', label: 'Direct & Bold' }, { value: 'consultative', label: 'Consultative' }] },
        ],
        promptTemplate: `Write a cold email from a sales professional to {{recipient_role}} at {{recipient_company}}.\n\nProduct/Service: {{your_product}}\nPain Point Being Addressed: {{pain_point}}\nTone: {{tone}}\n\nRequirements:\n- Subject line that gets opened (not clickbait, genuinely relevant)\n- Opening that shows you understand their specific situation\n- 1-2 sentences explaining what you do and who you help\n- One concrete, relevant result or case study (make it plausible)\n- Clear, low-friction call to action (15-minute call or specific question)\n- Total length: 100-150 words maximum\n- No generic phrases like "I hope this email finds you well"\n\nOutput format:\nSubject: [subject line]\n\n[email body]`,
        promptLibrary: [
          { id: 'ce-prompt-1', useCase: 'Classic Cold Outreach', prompt: 'Write a cold email to [Recipient Title] at [Company]. I offer [product/service] that helps [target audience] achieve [specific result]. The main pain point I solve is [pain point]. Keep it under 150 words, include a subject line, and end with a soft CTA asking for a 15-minute call. Tone: [professional/casual/direct].', platform: 'any', tags: ['cold email', 'B2B', 'outreach'] },
          { id: 'ce-prompt-2', useCase: 'Follow-Up Email Sequence', prompt: 'Write a 3-email follow-up sequence for a cold email prospect who has not responded. Email 1 (3 days after): gentle bump. Email 2 (7 days after): add new value or insight. Email 3 (14 days after): breakup email. Context: selling [product] to [role] at [company type]. Keep each email under 100 words.', platform: 'claude', tags: ['follow-up', 'email sequence', 'nurture'] },
        ],
        guideContent: [
          { type: 'intro', heading: 'How to Write Cold Emails That Actually Get Replies', body: "Cold email remains one of the highest-ROI sales channels when done correctly. The difference between a 2% reply rate and a 15% reply rate comes down to personalization, clarity, and value. This guide shows you how to use AI to craft cold emails that open doors." },
          { type: 'section', heading: 'The Anatomy of a High-Converting Cold Email', body: "Top-performing cold emails share a common structure that respects the recipient's time while creating genuine interest.", items: ['Subject line: specific, relevant, and curiosity-inducing (under 50 characters)', 'Opening line: reference something specific about them or their company', 'Value proposition: one clear sentence about what you do', 'Social proof: one concrete result or recognizable client name', 'CTA: ask for something small and specific, not a 30-minute demo'] },
          { type: 'callout', variant: 'warning', heading: 'Avoid These Cold Email Mistakes', content: "Never start with \"I hope this email finds you well.\" Avoid making your email about you — focus on what they gain. Don't attach files to cold emails. Don't ask for a full demo on first contact. Keep it under 150 words." },
        ],
        faq: [
          { id: 'ce-faq-1', question: 'What is a good cold email reply rate?', answer: 'A reply rate of 5-10% is considered good for cold email. Top performers achieve 15-25% by combining strong personalization, relevant timing, and a compelling value proposition. AI tools like this generator can help you craft more targeted messages that improve your reply rate.' },
          { id: 'ce-faq-2', question: 'How many follow-ups should I send?', answer: 'Send 3-4 follow-ups spaced 3-7 days apart. Studies show 80% of sales require at least 5 touchpoints, yet most salespeople give up after the first email. Each follow-up should add new value — a relevant article, case study, or insight — rather than just saying "checking in."' },
        ],
        seoToolTitle: 'Free Cold Email Generator | AI-Powered | PromptDesk',
        seoToolDesc: 'Generate personalized cold emails in seconds with AI. Free tool for sales professionals. Customize tone and value proposition.',
        seoPromptTitle: 'Best AI Prompts for Cold Emails (Copy-Paste Ready) | PromptDesk',
        seoPromptDesc: 'Copy-paste AI prompts for writing cold emails that get replies. Works with ChatGPT and Claude. Free for sales teams.',
        seoGuideTitle: 'How to Write a Cold Email: Complete Sales Guide | PromptDesk',
        seoGuideDesc: 'Master cold email writing with AI assistance. Proven frameworks, templates, and tips to increase your reply rate.',
        relatedSlugs: ['job-description-generator'],
      },
    })

    await Promise.all([
      prisma.toolProfession.upsert({
        where: { toolId_professionId: { toolId: coldEmailTool.id, professionId: sales!.id } },
        update: {},
        create: { toolId: coldEmailTool.id, professionId: sales!.id, isPrimary: true, sortOrder: 1 },
      }),
      prisma.taskTool.upsert({
        where: { taskId_toolId: { taskId: writeColdEmailTask.id, toolId: coldEmailTool.id } },
        update: {},
        create: { taskId: writeColdEmailTask.id, toolId: coldEmailTool.id, isPrimary: true, sortOrder: 1 },
      }),
    ])

    // Tool 3: Lesson Plan Generator
    const lessonPlanTool = await prisma.tool.upsert({
      where: { slug: 'lesson-plan-generator' },
      update: {},
      create: {
        slug: 'lesson-plan-generator',
        name: 'Lesson Plan Generator',
        shortDesc: 'Create detailed, curriculum-aligned lesson plans for any subject and grade level in minutes.',
        status: 'LIVE',
        blueprint: 'text-generator',
        aiOutputEnabled: false,
        publishedAt: new Date(),
        fieldsSchema: [
          { key: 'subject', type: 'text', label: 'Subject', placeholder: 'e.g. Mathematics, English Literature, Biology', required: true },
          { key: 'topic', type: 'text', label: 'Lesson Topic', placeholder: 'e.g. Introduction to Fractions, Romeo and Juliet Act 1', required: true },
          { key: 'grade_level', type: 'text', label: 'Grade Level', placeholder: 'e.g. Grade 5, 10th Grade, College Freshman', required: true },
          { key: 'duration', type: 'text', label: 'Lesson Duration', placeholder: 'e.g. 45 minutes, 90 minutes', required: true },
          { key: 'learning_objectives', type: 'textarea', label: 'Learning Objectives', placeholder: 'What should students know or be able to do by the end of this lesson?', required: true },
          { key: 'teaching_style', type: 'select', label: 'Teaching Style', required: true, options: [{ value: 'direct-instruction', label: 'Direct Instruction' }, { value: 'inquiry-based', label: 'Inquiry-Based Learning' }, { value: 'project-based', label: 'Project-Based Learning' }, { value: 'flipped-classroom', label: 'Flipped Classroom' }, { value: 'socratic', label: 'Socratic Method' }] },
        ],
        promptTemplate: `Create a detailed lesson plan for the following:\n\nSubject: {{subject}}\nTopic: {{topic}}\nGrade Level: {{grade_level}}\nDuration: {{duration}}\nTeaching Style: {{teaching_style}}\n\nLearning Objectives:\n{{learning_objectives}}\n\nPlease structure the lesson plan with these sections:\n1. **Overview & Objectives**\n2. **Materials Needed**\n3. **Warm-Up / Hook** (5-10 minutes)\n4. **Direct Instruction**\n5. **Guided Practice**\n6. **Independent Practice**\n7. **Closure**\n8. **Assessment**\n9. **Differentiation**\n10. **Homework / Extension** (optional)\n\nAlign all activities to the teaching style specified. Be specific and practical.`,
        promptLibrary: [
          { id: 'lp-prompt-1', useCase: 'Standard Lesson Plan', prompt: 'Create a [duration]-minute lesson plan for [grade level] students on [topic] in [subject]. Learning objectives: [list objectives]. Teaching style: [direct instruction/inquiry-based/project-based]. Include: warm-up activity, main instruction, guided practice, independent practice, and assessment strategy.', platform: 'any', tags: ['lesson plan', 'curriculum', 'teaching'] },
          { id: 'lp-prompt-2', useCase: 'Differentiated Instruction Plan', prompt: 'Create a differentiated lesson plan for a diverse [grade level] classroom learning [topic] in [subject]. Include three tiers of activities: below grade level, on grade level, and above grade level. Duration: [time]. Learning objectives: [objectives]. Provide specific activities and materials for each tier.', platform: 'claude', tags: ['differentiation', 'inclusion', 'diverse learners'] },
        ],
        guideContent: [
          { type: 'intro', heading: 'How to Create Effective Lesson Plans with AI', body: 'A well-structured lesson plan is the blueprint for effective teaching. It ensures you achieve your learning objectives, manage time efficiently, and keep students engaged. AI can dramatically reduce the time spent on lesson planning while helping you create more creative and comprehensive plans.' },
          { type: 'section', heading: 'Key Components of an Effective Lesson Plan', body: 'The best lesson plans follow a clear pedagogical structure that guides students from activation to mastery.', items: ["Clear, measurable learning objectives using Bloom's Taxonomy verbs", 'Engaging warm-up that activates prior knowledge', 'Scaffolded instruction that builds understanding progressively', 'Multiple practice opportunities (guided then independent)', 'Formative assessment to check for understanding', 'Differentiation strategies for diverse learners'] },
          { type: 'callout', variant: 'tip', heading: "Use Bloom's Taxonomy for Better Objectives", content: "Strong learning objectives use action verbs from Bloom's Taxonomy: remember (list, recall), understand (explain, summarize), apply (use, solve), analyze (compare, examine), evaluate (judge, critique), create (design, produce). Avoid vague objectives like \"students will understand fractions\" — instead write \"students will solve real-world problems involving fractions.\"" },
        ],
        faq: [
          { id: 'lp-faq-1', question: 'How detailed should a lesson plan be?', answer: "The right level of detail depends on your experience and school requirements. New teachers benefit from detailed plans (including exact questions to ask and anticipated student responses). Experienced teachers can use outline-style plans. All plans should clearly state objectives, the sequence of activities with time estimates, and how you'll assess understanding." },
          { id: 'lp-faq-2', question: 'How do I adapt a lesson plan for different learning styles?', answer: "Include a variety of modalities in each lesson: visual (diagrams, charts, videos), auditory (discussion, explanation, music), read/write (notes, worksheets, articles), and kinesthetic (hands-on activities, movement). You don't need to do all four every lesson — aim to rotate through different styles across the week to reach all learners." },
        ],
        seoToolTitle: 'Free Lesson Plan Generator | AI-Powered | PromptDesk',
        seoToolDesc: 'Create detailed lesson plans for any subject and grade level in minutes. Free AI tool for teachers and educators.',
        seoPromptTitle: 'Best AI Prompts for Creating Lesson Plans (Copy-Paste) | PromptDesk',
        seoPromptDesc: 'Copy-paste AI prompts for lesson planning. Works with ChatGPT and Claude. Free for teachers and educators.',
        seoGuideTitle: 'How to Create a Lesson Plan: Complete Teacher Guide | PromptDesk',
        seoGuideDesc: 'Complete guide to creating effective lesson plans with AI. Templates, frameworks, and tips for K-12 and higher education.',
        relatedSlugs: ['job-description-generator', 'cold-email-generator'],
      },
    })

    await Promise.all([
      prisma.toolProfession.upsert({
        where: { toolId_professionId: { toolId: lessonPlanTool.id, professionId: teachers.id } },
        update: {},
        create: { toolId: lessonPlanTool.id, professionId: teachers.id, isPrimary: true, sortOrder: 1 },
      }),
      prisma.taskTool.upsert({
        where: { taskId_toolId: { taskId: createLessonPlanTask.id, toolId: lessonPlanTool.id } },
        update: {},
        create: { taskId: createLessonPlanTask.id, toolId: lessonPlanTool.id, isPrimary: true, sortOrder: 1 },
      }),
    ])

    return new Response(JSON.stringify({ success: true, seeded: { professions: 6, tasks: 3, tools: 3 } }))
  } catch (err) {
    console.error('Seed error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
}
