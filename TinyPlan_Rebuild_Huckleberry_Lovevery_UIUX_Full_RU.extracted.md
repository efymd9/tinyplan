# Extracted from doc_421178859911_TinyPlan_Rebuild_Huckleberry_Lovevery_UIUX_Full_RU.pdf
Pages: 17


---

## Page 1

TinyPlan
Полное ТЗ по пересборке продукта
MVP по модели Huckleberry + Lovevery: parent-first daily coaching toolkit
Главная идея
TinyPlan должен перестать быть “одной игрой в день”. Новый продукт: ежедневный персональный toolkit для 
родителя: что делать, что сказать, как реагировать, как тренироваться самому, как адаптировать план и как 
получать поддержку в сложный момент.
Документ можно отправлять Claude Code / Herme / дизайнеру / контент-специалисту как единое ТЗ. Он описывает 
новую архитектуру продукта, контент, логику персонализации, экраны, data model и приоритеты реализации.


---

## Page 2

1. Почему текущий продукт не тянет на подписку
Сейчас продукт ощущается как список коротких карточек: одна игра, одна фраза, короткое “why it helps”. Это не 
создает ощущения paid value. Родитель после оплаты может прочитать всё за 5 минут и не увидеть причины 
возвращаться завтра.

Нет глубины: parent skill выглядит как цитата, а не мини-урок.

Нет “continuity”: день 1 не ведет к дню 2, нет ощущения программы.

Нет сильного “parent growth”: родитель не видит, какой навык он прокачивает.

Персонализация декларируется словами, но мало проявляется в структуре дня.

Недостаточно “ongoing support”: после оплаты нет сильного ощущения, что продукт будет помогать всю 
неделю.
Новая формула ценности
TinyPlan = 7-day parent coaching system: daily plan + parent skill + exact scripts + SOS coach + adaptive insights + 
weekly check-in.
2. Что взять у сильных продуктов рынка
Мы не копируем конкурентов. Мы берем их сильные принципы и переводим в быстрый MVP без видео, без 
большой команды экспертов и без сложного tracking-инфраструктурного продукта.
Продукт
Что у них сильное
Как адаптируем в TinyPlan MVP
Huckleberry
Custom plans, AI chat Berry, 
SweetSpot/Insights, weekly progress check-
ins, ongoing support.
Взять логику: персональный план + AI 
coach + weekly check-in + ongoing 
adjustment. Убрать сложный sleep tracking.
Lovevery
Stage-based guidance, week-by-week 
activities, expert advice, “just the right time” 
для возраста/стадии.
Взять логику: stage-based parent guidance 
+ curated weekly focus + уверенность 
родителя. Убрать физические kits и видео.
Kinedu
Personalized daily plan by age/stage, 
progress reports, expert content, guided play.
Взять логику: daily plan + library + progress 
reports + expert-style explanations. Без live 
classes.
BabySparks
Personalized activity program, milestones, 
adaptive technology, parent-led activities.
Взять логику: parent-led actions + 
адаптация + activity engine by tags. Без 
видео и milestones как medical/development 
claims.
Источники ресерча

Huckleberry App Store / pricing / Premium: AI chat Berry, custom plans, weekly check-ins, ongoing support.

Lovevery app pages: daily/stage-based activities, parenting tips, development information, expert insight.

Kinedu app pages: personalized daily plan by age/stage, progress reports, expert-led content.

BabySparks App Store / site: personalized daily activity program, parent-led activities, adaptive technology, 
milestones.
3. Новый продукт: TinyPlan Parent OS
Позиционирование
TinyPlan helps parents know what to do, what to say, and how to respond - one small moment at a time.

Не “app for kids”. Это приложение для родителя.

Ребенок не должен “заниматься в приложении”. Родитель получает инструменты для реальных бытовых 
моментов.


---

## Page 3


Каждый день = мини-коучинг для родителя + одна игра/практика с ребенком.

Главное обещание: “завтра будет легче, потому что сегодня мы узнаем, что у вас сработало”.
4. Новая платная ценность после подписки
Модуль
Зачем нужен
Daily Parent Toolkit
Каждый день не одна игра, а 5-6 раскрывающихся карточек: 
Focus, Play Moment, Parent Skill, Real-Life Practice, If It Gets Hard, 
Check-In.
7-Day Parent Growth Path
Неделя учит родителя 7 базовым навыкам: small control, 
predictable start, name before fixing, say less/show more, start 
smaller, calm boundary, repair & repeat.
Ask TinyPlan Coach
Чат как mini coach: задает уточнение, дает response plan, 
ссылается на текущий parent skill и предлагает adjust tomorrow.
Adaptive Loop
Feedback после каждого дня реально меняет завтра: shorter, 
calmer, more active, no-prep, more scripts.
Weekly Check-In
В конце недели: what worked, what felt hard, strongest parent skill, 
next week adjustment.
Parent Tool Library
Короткие, но полноценные mini-lessons для родителя, не one-
liners.
5. Архитектура продукта после пересборки
Раздел
Новая роль
Today
Главный ежедневный экран. Показывает Daily Parent Toolkit, не 
одну активность.
Week
Маршрут недели: parent skills + activities + why this sequence.
SOS
Ask TinyPlan сверху + quick cards. Цель: помощь в моменте, не 
библиотека статей.
Library
Activities, Parent Skills, Scripts, SOS resets, No-prep ideas, Bedtime, 
Screen transitions.
Progress
Parent Growth + family patterns + weekly check-in, а не просто “1/7 
done”.
Profile/Plan Settings
Возраст, цель, время, предпочтения, constraints. Можно менять 
без нового квиза.
6. Today: новая структура Daily Parent Toolkit
Самый важный экран. Он должен сразу показывать, за что человек заплатил. Не раскрывать весь текст сразу. Все 
блоки должны быть accordion cards.
Правило
Collapsed card = коротко и понятно. Expanded card = реальная ценность: шаги, примеры, фразы, fallback, 
reflection.
6.1 Верхняя карточка Today
Сверху экрана показывать:

Day X of 7

Today’s parent skill

Why this fits your plan - на основе quiz tags

Today includes: play moment, parent lesson, real-life practice, SOS backup, check-in


---

## Page 4

Пример текста на английском:
Day 1 of 7
Today’s parent skill: Small Control
You’ll practice giving your child one tiny choice when something feels hard.
Included today: 1 play moment, 1 parent skill lesson, 3 scripts, 1 backup, 1 check-in.
6.2 Accordion cards на Today
Карточка
Роль
Пример
1. Focus
Короткое объяснение навыка дня.
Today you’ll practice Small Control: helping 
your child find one small choice inside a hard 
moment.
2. Play Moment
Игра/активность, связанная с навыком 
дня.
Tiny City Choices: build a tiny city and let 
your child choose small parts.
3. Parent Skill Lesson
Полноценный mini-lesson для родителя.
When to use, what you practice, 3-step 
move, scripts, examples, avoid, tiny win.
4. Real-Life Practice
Как применить навык вне игры в течение 
дня.
Use Small Control once when something 
doesn’t go your child’s way.
5. If It Gets Hard
Что делать при отказе/истерике/потере 
интереса.
Start smaller, hold boundary, offer two 
choices, stop without shame.
6. Check-In
Фидбек, который меняет завтра.
Worked well / Too much / Refused / 
Skipped / Shorter tomorrow / More play 
tomorrow.
7. 7-Day Parent Growth Path
Неделя должна ощущаться как программа развития родителя. Каждый день учит один навык и связывает игру, 
скрипты, SOS и check-in с этим навыком.
День
Parent Skill
Что тренирует родитель
Play Moment
Day 1
Small Control
Давать один маленький выбор, 
когда ребенок не контролирует 
ситуацию.
Tiny City Choices
Day 2
Predictable Start
Делать начало понятным: first / 
then / done.
First-Then Adventure
Day 3
Name Before Fixing
Сначала назвать чувство, 
потом решать проблему.
Feeling Detective
Day 4
Say Less, Show More
Меньше лекций, больше 
действия и показа.
Copy Me Mission
Day 5
Start Smaller
Снижать вход, если ребенок 
сопротивляется.
One Tiny Step
Day 6
Calm Boundary
Держать границу спокойно и 
коротко.
Stop-Go Ritual
Day 7
Repair & Repeat
Замечать, что сработало, и 
повторять лучшее.
Tiny Win Map
8. Контент: готовые карточки на английском для MVP
Ниже готовый английский контент, который можно сразу заложить в seed data. Это не финальная редактура на 
100%, но уже правильная глубина: не one-liner, а мини-уроки.
Day 1 - Small Control
Field
Content
Play Moment
Tiny City Choices
When to use it
Use this when your child is upset because something can’t happen or 
plans changed.
What parent practices
You are not trying to fix the whole feeling. You are helping your child 
find one tiny part they can still choose.
3-step move
1. Name the limit: “The park is closed today.”
2. Name the feeling: “You really wanted to go. That’s disappointing.”
3. Offer two small choices: “Do you want to build a park at home or 
take a short walk?”


---

## Page 5

Say it like this
“We can’t change that part. What can we choose now?”
“You can choose the blanket or the pillow.”
“Do you want me close or a little space?”
Avoid this
Do not offer ten choices. Do not explain too much while your child is 
very upset.
Tiny win
If your child chooses one small next step or calms even a little, that 
counts.
Day 2 - Predictable Start
Field
Content
Play Moment
First-Then Adventure
When to use it
Use this before an activity, transition, bedtime step, or any moment 
that often turns chaotic.
What parent practices
You are making the next few minutes visible so your child does not 
have to guess what is coming.
3-step move
1. Say what happens first.
2. Say what happens next.
3. Say how it ends.
Say it like this
“First we build, then we read, then we’re done.”
“First shoes, then door, then car.”
“First two blocks, then you choose what happens next.”
Avoid this
Do not give a long list. Keep it to first, then, done.
Tiny win
If your child understands the next step faster than usual, that counts.
Day 3 - Name Before Fixing
Field
Content
Play Moment
Feeling Detective
When to use it
Use this when your child is frustrated, disappointed, jealous, tired, or 
overwhelmed.
What parent practices
Before solving the problem, you help your child feel seen. Naming the 
feeling lowers pressure and makes cooperation easier.
3-step move
1. Notice the emotion.
2. Name it simply.
3. Wait one beat before offering a solution.
Say it like this
“That felt really frustrating.”
“You wanted it to go differently.”
“I can see this is a big feeling.”
Avoid this
Do not rush into “it’s okay” or “just do this”. The feeling needs a name 
before a fix.
Tiny win
If your child pauses, looks at you, or softens even briefly, that counts.
Day 4 - Say Less, Show More
Field
Content
Play Moment
Copy Me Mission
When to use it
Use this when your child gets stuck, ignores instructions, or becomes 
overwhelmed by too many words.
What parent practices
You reduce language and make the action easier to copy.
3-step move
1. Use one short phrase.
2. Show the action with your body or hands.
3. Let your child copy, change, or join in their own way.
Say it like this
“Watch me.”
“Your turn.”
“Just one.”
Avoid this
Do not repeat the same instruction louder. Make it smaller and visible 
instead.
Tiny win
If your child copies one tiny action, that counts.
Day 5 - Start Smaller
Field
Content
Play Moment
One Tiny Step
When to use it
Use this when your child refuses, freezes, says “no”, or loses interest 
quickly.
What parent practices
You lower the entry point so joining feels easy, not demanding.


---

## Page 6

3-step move
1. Make the task smaller.
2. Invite one tiny action.
3. Stop before it becomes a battle.
Say it like this
“You don’t have to do the whole thing. Just choose one piece.”
“Can you put one block here?”
“Let’s try for one minute.”
Avoid this
Do not turn the activity into a test. The goal is joining, not completing.
Tiny win
If your child does one small part, the plan worked.
Day 6 - Calm Boundary
Field
Content
Play Moment
Stop-Go Ritual
When to use it
Use this when the answer is no, screen time is over, bedtime starts, 
or it is time to leave.
What parent practices
You hold the boundary with fewer words and a calmer body.
3-step move
1. Say the boundary once.
2. Acknowledge the feeling.
3. Offer the next small action.
Say it like this
“The screen is done.”
“You really wanted more.”
“You can choose: blanket den or snack helper.”
Avoid this
Do not debate the boundary after it is set. Repeat calmly if needed.
Tiny win
If you stay calmer than usual, that counts even if your child is still 
upset.
Day 7 - Repair & Repeat
Field
Content
Play Moment
Tiny Win Map
When to use it
Use this at the end of the week or after a hard moment that did not go 
perfectly.
What parent practices
You notice what worked and repair what felt messy without shame.
3-step move
1. Name one thing that worked.
2. Name one thing that was hard.
3. Choose one thing to repeat next week.
Say it like this
“That was hard, and we came back.”
“One thing worked: we started smaller.”
“Tomorrow we can try the short version.”
Avoid this
Do not score the week as success/failure. Look for patterns.
Tiny win
If you can name one repeatable tool, the week succeeded.
9. Parent Tool Library: структура карточек
Library должна содержать не только activities, но и Parent Tools. Это “карточки навыков” для родителя. Они не 
должны быть короткими цитатами. Каждая карточка должна открываться и давать полноценный микро-урок.
Поле
Описание
Tool name
Название навыка: Small Control, Calm Boundary, First/Then/Done.
When to use
В каких бытовых ситуациях применять.
What you practice
Что тренирует родитель, не ребенок.
3-step move
Короткий алгоритм.
Scripts
3-5 готовых фраз.
Examples
3 реальных ситуации.
Avoid
Чего не делать.
Tiny win
Как понять, что практика засчитана.
Related activities
Какие игры/дни недели связаны с навыком.
10. SOS + Ask TinyPlan Coach
Правило SOS


---

## Page 7

SOS должен быть первым местом, куда родитель идет в сложный момент. Ask TinyPlan должен быть сверху 
страницы, а не внизу.
Ask TinyPlan должен работать не как генератор “4 советов”, а как mini coaching conversation.
1.
Если запрос сложный (“meltdown”, “crying”, “refuses”, “screaming”), сначала задать 1 уточняющий вопрос.
2.
Спросить, что случилось перед ситуацией: screen ended / bedtime started / parent said no / time to leave / tired / 
not sure.
3.
Спросить, может ли ребенок сейчас слушать: no, partly, yes, moment passed.
4.
Дать ответ в структуре: First 30 seconds, What to say, What not to do, Tiny next step, Link to today’s parent skill, 
Adjust tomorrow?
Пример ответа Ask TinyPlan
Parent: “My daughter is melting down because screen time ended.”
TinyPlan:
First, don’t try to explain yet. She is probably not ready for logic.
1. Get lower and quieter.
Say: “You really wanted more. Stopping is hard.”
2. Hold the boundary.
Say: “The screen is done.”
3. Offer Small Control.
Say: “You can choose: blanket den or snack helper.”
4. If she refuses both.
Say: “Okay. I’ll stay close. We’ll choose when your body is ready.”
Today’s parent skill: Small Control.
Want me to make tomorrow’s plan more focused on screen transitions? [Yes] [No]
11. Week: из списка дней в weekly coaching path
Week должен показывать не просто карточки активностей, а маршрут родительских навыков.
Блок
Что показывать
Header
Your 7-day parent growth path
Built from answers
Age, main goal, hardest moment, plan style, time available.
Weekly focus
Day 1-2: Calm the hardest moment; Day 3-4: Practice core skill; Day 
5-6: Add flexibility; Day 7: Review and repeat.
Toolkit included
7 play moments, 7 parent skills, scripts, SOS, Ask TinyPlan, weekly 
check-in.
12. Progress: Parent Growth, не только completion
Progress должен отвечать на вопрос: “Я как родитель чему-то научился?”
Блок
Смысл
Parent skills practiced
Список навыков недели с галочками.
Strongest skill so far
Например: “You used Small Control twice this week.”
Family pattern
“Your child responds better to short, low-prep activities.”
Next adjustment
“Tomorrow will be shorter and calmer because Day 2 felt too much.”
Weekly check-in
5 вопросов в конце недели, которые строят next week plan.


---

## Page 8

13. Weekly Check-In
Это ключ к retention. В конце недели продукт должен не просто показать “7/7 done”, а собрать данные и 
пообещать лучшее продолжение.
Вопросы weekly check-in:

Which moment felt easiest this week?

Which activity did your child respond to best?

Which parent skill helped you most?

What felt too much?

What should next week include more of? shorter / calmer / more active / more independent / more bedtime support
После check-in показывать:
Next week we’ll adjust your plan: more low-prep bedtime activities, shorter scripts, and one extra 
screen transition routine.
14. Персонализация: как связать quiz с продуктом
Каждая фича должна показывать, что она построена из ответов квиза. Не писать “personalized” без 
доказательств.
Ответ квиза
Использование
Quiz answer
Как влияет на продукт
Age
Фильтрует activity variants: toddler / preschool / older preschool / 
school-ready.
Main pain
Выбирает weekly focus и SOS cards.
Help moment
Выбирает routine: bedtime soft landing, after-preschool reset, screen 
transition bridge.
Time available
Выбирает duration и quick version по умолчанию.
Child style
Выбирает play type: builder, explorer, story seeker, routine seeker.
Parent obstacle
Добавляет relevant supports: scripts, shorter version, no-prep, 
backup.
Avoid
Исключает messy/long/loud/homework-feel activities.
15. Data model для разработки
Минимальная структура данных нужна, чтобы Claude Code не делал статический набор карточек.
UserProfile {
  childAge: number,
  ageBand: '2-3' | '3-4' | '4-5' | '5-6',
  childName?: string,
  mainPain: string[],
  helpMoment: string,
  childStyle: string[],
  activityPreference: string[],
  timeAvailable: string,
  parentObstacles: string[],
  supportNeeds: string[],
  avoid: string[],
  materials: string[],
  planFormat: string,
  feedbackHistory: Feedback[]
}
DailyToolkit {
  dayNumber: number,
  theme: string,
  parentSkillId: string,
  playMomentId: string,


---

## Page 9

  routineId?: string,
  cards: ToolkitCard[],
  checkInOptions: string[]
}
ParentSkill {
  id: string,
  title: string,
  whenToUse: string,
  whatYouPractice: string,
  steps: string[],
  scripts: string[],
  examples: string[],
  avoid: string[],
  tinyWin: string,
  relatedTags: string[]
}
Feedback {
  day: number,
  result: 'worked' | 'too_much' | 'refused' | 'skipped' | 'loved',
  requestedAdjustment?: 'shorter' | 'calmer' | 'more_play' | 'no_prep'
}
16. Реализация: задачи для Claude Code / Herme
P0 - сделать до запуска
5.
Пересобрать Today в Daily Parent Toolkit: Focus, Play Moment, Parent Skill Lesson, Real-Life Practice, If It Gets 
Hard, Check-In.
6.
Все Today blocks сделать accordion cards: collapsed short, expanded rich.
7.
Убрать one-line Parent Skill cards. Заменить на полную структуру: when to use, what you practice, 3-step move, 
scripts, examples, avoid, tiny win.
8.
Добавить 7-day parent growth path и seed data для 7 дней.
9.
Week пересобрать как coaching path, а не список игр.
10. Progress пересобрать как Parent Growth: practiced skills, patterns, next adjustment.
11. Ask TinyPlan перенести вверх SOS и сделать structured coaching response.
12. Final quiz/paywall copy изменить: продавать “7-day parent toolkit”, а не “7 activities”.
13. Добавить personalization explanation в каждый день: “Because you said X, today uses Y”.
P1 - сразу после запуска
14. Weekly Check-In и next week generation.
15. Parent Tool Library с поиском и фильтрами.
16. Age variants для всех play moments.
17. Adaptive insights с confidence level: early signal / pattern / strong pattern.
18. Email / reminder loop: weekly plan summary, day reminder, “your next tiny win”.
P2 - позже
19. Caregiver sharing.
20. Printable cards / fridge view.
21. Audio scripts for parents.
22. Expert review layer / professional content validation.
23. Multi-week curriculum with themes: transitions, bedtime, independence, screen-free play, emotional regulation.
17. UX acceptance checklist

После оплаты пользователь не должен видеть только одну игру. Он должен видеть полный Daily Toolkit.


---

## Page 10


Ни одна Parent Skill карточка не должна состоять из одной фразы и “why it helps”.

Каждый день должен явно учить родителя одному навыку.

Play Moment должен быть связан с parent skill дня.

Ask TinyPlan должен ссылаться на current day skill, если это уместно.

Progress должен показывать рост родителя, а не только activities done.

Финальный paywall должен объяснять, что разблокируется: toolkit, scripts, SOS, Ask TinyPlan, adaptive insights.

Везде, где написано personalized, должна быть конкретика из quiz answers.

Текст должен быть глубокий, но UI не должен быть простыней: использовать accordion.

Продукт не делает medical/development diagnosis и не обещает “исправить” ребенка.
18. Новая формулировка для лендинга и paywall
Landing headline:
A 7-day parent toolkit for calmer days with your child.
Landing subheadline:
Get one play moment, one parent skill, ready-to-use scripts, and real-time SOS support every day - 
personalized around your child’s age, your routine, and the moments that feel hardest.
Paywall headline:
Unlock your full 7-day parent toolkit.
Paywall bullets:
 7 age-appropriate play moments
✓
 7 parent skills to practice
✓
 exact scripts for hard moments
✓
 SOS support and Ask TinyPlan
✓
 shorter/easier backup versions
✓
 adaptive insights from your check-ins
✓
19. Итоговое направление
Финальный вывод
TinyPlan должен стать не “игры для детей”, а ежедневный тренер для родителя. Успешный MVP должен давать 
ощущение: “Я просыпаюсь завтра и хочу открыть TinyPlan, потому что там мой следующий маленький шаг, мой 
новый навык, готовые слова и поддержка, если всё пойдет не по плану.”
20. Sources / competitor references

Huckleberry App Store: https://apps.apple.com/ua/app/huckleberry-baby-child/id1169136078?l=uk

Huckleberry Pricing/Premium: https://huckleberrycare.com/pricing and https://huckleberrycare.com/product/premium

Lovevery app: https://shop.lovevery.com/pages/mobile and https://blog.lovevery.com/product-recommendations/the-
lovevery-app-for-parents/

Kinedu: https://play.google.com/store/apps/details?id=com.kinedu.appkinedu and https://app.kinedu.com/

BabySparks: https://babysparks.com/ and https://apps.apple.com/us/app/babysparks-development-app/id794574199


---

## Page 11

17. UI/UX пересборка: сделать продукт визуально дорогим, а не 
текстовой простыней
Задача этой части ТЗ: объединить продуктовую пересборку TinyPlan с новым UI/UX-слоем. После 
оплаты пользователь должен увидеть не набор длинных текстов, а спокойный, премиальный, 
управляемый интерфейс: карточки, иконки, прогресс, раскрывающиеся блоки, короткие превью и 
ощущение личного родительского коуча.
17.1 Главный UX-принцип
TinyPlan не должен выглядеть как блог, PDF или Notion-страница. Он должен ощущаться как 
мобильный parent operating system: каждый экран отвечает на вопрос “что мне сделать сейчас?”

Показываем сверху только краткую ценность и следующий шаг.

Подробности прячем в раскрывающиеся карточки.

Каждая карточка имеет иконку, цветовой акцент, короткое описание и clear action.

Нет больших абзацев на первом уровне. Большие объяснения доступны только после tap/open.

Каждый день выглядит как программа: parent skill + play moment + practice + SOS fallback + check-in.
17.2 Почему текущий интерфейс ощущается дешевым
Сейчас проблема не в том, что текста много вообще. Проблема в том, что текст не иерархизирован: 
родитель видит одинаковые карточки, одинаковую плотность, одинаковые короткие фразы без 
ощущения глубины.

Одна строка “Say it like this” не выглядит как платная ценность.

Parent Skill выглядит как Instagram-tip, а не mini lesson.

Нет ощущения, что день связан с неделей и с прогрессом родителя.

Иконки есть, но они не создают систему: нужно назначить каждому типу контента свой визуальный язык.

После оплаты нужно сразу показать “вау, тут структура”, а не “мне дали набор предложений”.
17.3 Что берем из UX сильных продуктов
У Huckleberry сильна логика: tracking -> insights -> personalised plan -> ongoing support. У Lovevery 
сильна логика: stage-based guidance -> weekly focus -> activities -> parent education. TinyPlan должен 
взять эти принципы и реализовать без видео и сложной команды экспертов.

От Huckleberry: ощущение ongoing support, адаптивные инсайты, weekly check-ins, AI-помощник, план как 
живой объект.

От Lovevery: week-by-week guidance, stage-based контент, “what to focus on now”, мягкий экспертный тон, play 
guide формат.

От хороших mobile UX-систем: cards for one topic, chips for быстрых фильтров/действий, bottom nav 3-5 
destination, progressive disclosure через accordions.

Итог для TinyPlan: не “activities library”, а “daily parent coaching journey”.
17.4 Новый дизайн-принцип для Today
Today - главный экран удержания. Он должен выглядеть как dashboard на день, а не как статья.

Верхняя hero card: Day X of 7, parent skill дня, why this fits your quiz answers, иконка/иллюстрация.

Блок “Today includes”: 5 маленьких chips: Play, Parent Skill, Real-life Practice, If it gets hard, Check-in.

Под ним 5 accordion cards. В collapsed state показывать только: icon, category, title, one-line promise, estimated 
time.

Expanded state: показывать полноценный mini lesson с шагами, examples, avoid, tiny win.

Sticky bottom CTA: “Mark today” или “Check in”. Не перекрывать текст и учитывать safe-area.


---

## Page 12

17.5 Today: recommended visual layout
Top hero card:
Day 1 of 7 · Parent Growth Path
Today’s parent skill: Small Control
Why this fits: You chose calmer transitions + bedtime + 7-10 min.
[Illustration / soft icon]
Today includes:
[Play] [Parent Skill] [Practice] [Backup] [Check-in]
Accordion 1: Play Moment
Accordion 2: Parent Skill Lesson
Accordion 3: Real-Life Practice
Accordion 4: If It Gets Hard
Accordion 5: Tiny Check-in
17.6 Компоненты карточек
Нужно создать единую систему компонентов. Это позволит контенту выглядеть как продукт, а не как 
random cards.

Daily Hero Card - большая карточка дня с иллюстрацией, фокусом, персонализацией и progress.

Toolkit Accordion Card - раскрывающаяся карточка для Play/Skill/Practice/SOS/Check-in.

Skill Lesson Card - полноценный мини-урок: When to use, 3-step move, scripts, examples, avoid, tiny win.

Quick Action Chips - shorter, easier, no prep, make calmer, swap.

Insight Card - короткий вывод системы с confidence level: early signal / stronger pattern.

Empty State Card - маленькая иллюстрация + один CTA.

Paywall Value Card - что именно разблокируется, привязано к ответам квиза.
17.7 Иконки: единая система
Использовать один набор outline-иконок, например Lucide, Phosphor или Heroicons. Важно: не 
смешивать разные стили и не использовать случайные emoji/желтые звезды.

Play Moment: Smile / Sparkles / Blocks.

Parent Skill: MessageCircle / Brain / UserCheck.

Emotional Tool: Heart / Wind / Shield.

If It Gets Hard: LifeBuoy / RefreshCw / AlertCircle.

Check-in: CheckCircle / ClipboardCheck.

Routine: Clock3 / Repeat / Moon.

SOS: Siren / HeartPulse / MessageCircle.

Library: BookOpen / Search / SlidersHorizontal.

Progress: BarChart3 / TrendingUp / Award.

Locked content: LockKeyhole.

AI chat: Bot / Sparkles / MessageCircle, но лучше без “robotic” ощущения.
17.8 Цветовая кодировка типов контента
Каждый тип карточки должен иметь свой мягкий цветовой акцент, чтобы родитель быстро 
ориентировался.

Play Moment - peach / warm coral.

Parent Skill - soft lavender or blush.

Emotional Tool - sage green.

If It Gets Hard - warm yellow / cream.


---

## Page 13


Check-in / Progress - muted green.

SOS / urgent support - peach + soft red accent, без агрессивного красного.

Locked / paywall - cream + subtle glow + orange CTA.
17.9 Типографика и плотность текста
Правило: первый уровень интерфейса должен сканироваться за 5-7 секунд.

H1 на экранах: 28-34 px mobile, жирный, максимум 2 строки.

Card title: 18-22 px, bold.

Preview text: 14-16 px, muted gray, максимум 1-2 строки.

Expanded body: 16-18 px, line-height 1.45-1.6.

Секции внутри expanded card разделять mini headings: When to use, 3-step move, Say this, Avoid, Tiny win.

Максимум 2-3 предложения в одном блоке. Всё длинное превращать в bullets/steps.
17.10 Правила progressive disclosure
Использовать раскрытие по слоям: сначала “что это”, потом “как сделать”, потом “почему работает”. 
Это снижает перегруз и позволяет дать глубину без ощущения простыни.

Collapsed card: icon + title + 1-line value + time.

Open card: сначала Quick Start, затем steps, затем scripts, затем why/avoid.

Не раскрывать все карточки одновременно по умолчанию. По умолчанию раскрыта только первая нужная 
карточка дня.

Для caret использовать понятную стрелку вниз/вверх. Не использовать маленькую неочевидную стрелку.

После выполнения блока показывать маленький done-state на карточке.
17.11 Today card expanded structure: обязательный формат
Parent Skill expanded card:
1. When to use it
2. What you are practicing
3. The 3-step move
4. Say it like this
5. Real-life examples
6. Avoid this
7. Tiny win
8. Practice today
Play Moment expanded card:
1. Goal
2. You’ll need
3. Quick version
4. Full steps
5. Parent script
6. If they lose interest
7. Age adaptation note
17.12 Week screen: из списка дней в learning path
Week не должен быть просто списком активностей. Он должен показывать путь развития родителя.

Hero: Your 7-Day Parent Growth Path.

Верхний блок: “This week you’ll practice” с 3-4 навыками.

Timeline: Day 1-7 с иконками навыков, progress state и мини-описанием.

Каждый день показывает parent skill + play moment, а не только название игры.


---

## Page 14


Добавить блок “Why this week is built this way” на основе quiz answers.

Добавить “Upcoming focus” - что завтра будет тренироваться.
17.13 Week visual layout
Your 7-Day Parent Growth Path
Built for: Age 5 · bedtime · calmer transitions · 7-10 min
This week you’ll practice:
[Small Control] [Predictable Start] [Calm Boundary]
Timeline:
Day 1 - Small Control - Tiny City Choices
Day 2 - Predictable Start - First/Then Adventure
...
Upcoming:
Tomorrow we’ll practice Predictable Start.
17.14 SOS screen: сделать как calm command center
SOS - самый ценный paid экран, если он работает как родительский коуч, а не как FAQ.

Сверху Ask TinyPlan input, не внизу.

Под input - chips быстрых ситуаций: screen ending, meltdown, bedtime, says no, parent needs a moment.

После отправки - не сразу 4 пункта, а guided flow: what happened before? can child listen? then response.

Ответ должен ссылаться на today parent skill: “Today we’re practicing Small Control, so try this...”

Добавить “Save this as pattern” / “Adjust tomorrow’s plan”.

SOS cards должны иметь структуру: First 30 seconds, What to say, What not to do, After calm, Tiny next step.
17.15 Library: не свалка, а toolkit hub
Library нужно разделить на понятные коллекции, а не просто search + list.

Activities - игры и play moments.

Parent Skills - мини-уроки для родителя.

SOS Scripts - трудные моменты.

3-Minute Resets - быстрые решения.

Routines - bedtime, screen transition, after preschool.

Saved - сохраненные фразы/карточки.

Filters as chips: no prep, 3 min, bedtime, outside, low energy, refuses, screen-free.

Карточки Library не должны иметь большие желтые звезды. Использовать thumbnails/soft category icons.
17.16 Progress: показать рост родителя, не только completion
Progress должен продавать подписку: “система учится, родитель растет”.

Parent Skills practiced this week.

What worked best for your family.

Patterns we noticed - только если есть достаточно данных.

Next recommended skill.

Tiny wins log - не “completed tasks”, а реальные моменты.

Insight confidence: Early signal / Pattern / Strong pattern.

Weekly check-in: 3 вопроса в конце недели, после которых строится следующий план.


---

## Page 15

17.17 Paywall / result UX
Paywall должен ощущаться как “unlock what we built from your answers”, а не как generic payment screen.

Сверху показать Play Profile + Age + Main Goal.

Показать “Built from your answers” с 4-6 summary chips.

Показать locked preview: Day 1, Day 2, routine, parent skills.

Value stack: 7 daily toolkits, parent skill lessons, SOS coach, routines, adaptive insights.

CTA: Start my 7-day plan - $1.

Под CTA: Then $14.99/month. Cancel anytime.

Убрать “Continue in dev mode” на production.
17.18 Иллюстрации: где ставить
Иллюстрации должны помогать эмоционально, а не превращать продукт в детский сад.

Landing hero - обязательно, большая warm editorial illustration.

Quiz intro - маленькая spot illustration.

Quiz loading - “building your plan” illustration.

Result/paywall - план раскрывается / unlock clarity.

Dashboard welcome - calm home moment.

SOS top - parent breathing / calming support.

Empty states - small spot illustrations.

Today top card - optional, маленькая hero illustration.

Не ставить иллюстрацию в каждую карточку и каждый вопрос квиза.
17.19 Motion и микровзаимодействия
Даже без сложной анимации можно сделать продукт дороже через micro-interactions.

Accordion open/close: 180-220ms ease-out.

Done state на карточке: мягкий check + haptic-like visual.

Progress dots: плавное заполнение.

Loading screen: checklist items появляются по очереди.

Ask TinyPlan: typing state + guided question cards.

Paywall lock preview: мягкий blur + lock button, без агрессивного dark overlay.
17.20 Mobile safe-area и browser UI
Скрины показывают, что Safari/встроенный браузер перекрывает верх и низ. Это критично.

Добавить padding-top с учетом safe-area-inset-top.

Sticky header не должен перекрывать контент при scroll.

Bottom nav + sticky CTA должны учитывать safe-area-inset-bottom.

Не ставить большие bottom sheets поверх основного текста, если пользователь скроллит.

Проверить на iPhone mini/SE, iPhone 14/15/16 Pro, Android Chrome.
17.21 Design tokens для разработки
Colors:
background: #FBF7F0 / cream
surface: #FFFFFF
primary: #EF815B / warm coral
primaryLight: #FCE8DF
sage: #6C9B83
sageLight: #EEF7F1
yellow: #D8B542
yellowLight: #FFF7DF


---

## Page 16

lavenderLight: #F4EEF8
textPrimary: #2D2B29
textSecondary: #8A8580
border: #E9E1DA
Radius:
card: 24px
button: 20px
chip: 999px
Spacing:
pageX: 24px mobile
cardPadding: 20-24px
sectionGap: 16-24px
Shadow:
soft card shadow only, low opacity. Avoid heavy shadows.
17.22 Concrete P0 tasks for Claude Code / Herme

Create reusable components: DailyHeroCard, ToolkitAccordionCard, SkillLessonContent, InsightCard, 
EmptyStateCard, ActionChipRow, BottomSafeCTA.

Replace one-line Parent Skill content with full mini-lesson structure.

Implement Today as Daily Toolkit with 5 accordion cards.

Add iconName, accentColor, illustrationUrl, collapsedSummary, expandedSections to content data model.

Move Ask TinyPlan to the top of SOS and redesign as guided flow.

Create Library categories: Activities, Parent Skills, SOS Scripts, 3-Minute Resets, Routines, Saved.

Redesign Progress around Parent Growth and Adaptive Insights.

Update Week to show 7-Day Parent Growth Path timeline.

Update Paywall to show “Built from your answers” and locked plan preview.

Add safe-area support for top and bottom fixed elements.
17.23 P1 tasks after P0

Add real illustration asset slots for landing, quiz loading, result, SOS, dashboard welcome, empty states.

Add micro-interactions for accordion, progress, done states.

Add saved scripts/favorites.

Add weekly check-in flow.

Add “Adjust tomorrow” logic from feedback and SOS usage.

Add content tagging for personalization: ageBand, parentSkill, painPoint, timeAvailable, materials, difficulty, energy.
17.24 Acceptance checklist для UI/UX

На Today пользователь за 5 секунд понимает: какой навык дня, что делать, что открыть первым.

Ни один collapsed card не содержит больше 2 строк preview text.

Expanded card выглядит как mini lesson, а не как одно предложение.

На экране нет одновременной простыни из текста.

Каждый тип контента имеет иконку и цветовой акцент.

Week выглядит как путь на 7 дней, а не список игр.

Progress показывает рост родителя и family patterns.

Paywall показывает, что план построен из ответов пользователя.

SOS начинается с Ask TinyPlan, а не с длинного списка карточек.

Все fixed elements учитывают mobile safe-area и не перекрывают текст.


---

## Page 17

18. Источники и UX-референсы для команды
Источник
Что берем
URL
Huckleberry App Store / 
официальный листинг
поддержка через AI chat и трекинг 
как принцип ongoing support
https://apps.apple.com/es/app/
huckleberry-baby-child/
id1169136078?l=en-GB
Lovevery App Store / официальный 
листинг
daily activities, parenting tips, child 
development information, expert 
insight
https://apps.apple.com/us/app/
lovevery-baby-toddler-app/
id1556748552
Lovevery blog: app for parents
week-by-week guidance, activities, 
articles, expert advice, My Child 
feature
https://blog.lovevery.com/product-
recommendations/the-lovevery-app-
for-parents/
Material Design Cards
cards should be easy to scan and 
show one topic clearly
https://m3.material.io/components/
cards
Material Design Chips
chips for selections, filters, 
suggestions and quick actions
https://m3.material.io/components/
chips/guidelines
Material Bottom Navigation
bottom nav for 3-5 top-level 
destinations
https://m2.material.io/components/
bottom-navigation
NN/g Accordions
accordions reduce scrolling but 
increase interaction cost; use 
deliberately
https://www.nngroup.com/articles/
accordions-on-desktop/
19. Финальная короткая задача для разработки
Пересобрать TinyPlan как parent-first coaching product. Главный экран после оплаты - не одна активность, а 
Daily Parent Toolkit. Каждый день должен обучать родителя одному навыку, давать игру для практики, 
реальные сценарии, SOS fallback и check-in. UI должен быть карточным, иерархичным, с иконками, цветовой 
кодировкой, аккуратными иллюстрациями и progressive disclosure. Пользователь не должен видеть “кучу 
текста”; он должен видеть понятный путь: что делать сейчас, чему я сегодня учусь, как это поможет завтра.
