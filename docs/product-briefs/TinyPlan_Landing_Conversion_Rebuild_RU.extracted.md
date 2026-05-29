# Page 1

TinyPlan landing rebuild spec - internal product brief
TinyPlan
Полное ТЗ по пересборке лендинга для 
максимальной конверсии
Версия для Claude Code / Herme / дизайнера / верстальщика
Ключевая задача лендинга
За 8-15 секунд объяснить родителю: TinyPlan - это не “список игр”. Это персональный 7-дневный parent toolkit: 
что делать, что сказать, как реагировать в сложный момент и как становиться спокойнее как родитель.
Документ включает: глубокий анализ текущего лендинга, конкурентные принципы Huckleberry/Lovevery/Kinedu/BabySparks, 
новую структуру лендинга, точные тексты на английском, UI/UX-спецификацию, блоки, иконки, иллюстрации, мобильную 
адаптацию и чеклист разработки.


# Page 2

TinyPlan landing rebuild spec - internal product brief
1. Короткий вердикт по текущему лендингу
Сейчас лендинг не продает платную ценность
Он выглядит аккуратно, но слишком тихо и “пусто”. Пользователь видит большую фразу, одну иллюстрацию и 
несколько карточек с общими обещаниями. После этого не возникает ощущения: “Они понимают мою боль, 
продукт глубокий, я хочу пройти квиз”.

Hero слишком абстрактный: “7-day parent toolkit” звучит хорошо, но не показывает конкретную боль и 
конкретный результат.

Нет сильного “problem -> relief” перехода: родитель не узнает себя в первых 5 секундах.

Фичи перечислены текстом, но не выглядят как живой продукт: нет UI-preview, steps, locked value, 
personalization summary.

Секция “example toolkit” слишком слабая: она показывает одну карточку, а нужно показать структуру 
ежедневного набора.

Не хватает доверия: нет “no diagnosis / no child data / parent-first / age-appropriate / no extra screen time”.

Не хватает визуального ритма: много белого пространства без смысла, мало иконок, нет диаграммы “как 
работает продукт”.

CTA слабоват: “Build my plan - free quiz” ок, но рядом нет достаточно причин начать прямо сейчас.
2. Что рынок уже доказал: что надо взять у сильных 
продуктов
Ниже не копируем чужой продукт, а берём принципы, которые уже работают: персонализация, ежедневная 
структура, родительская уверенность, ongoing support и ощущение “мне подсказывают, что делать дальше”.
Продукт
Что у них продает ценность
Что взять для TinyPlan
Huckleberry
Custom plans, insights, expert-vetted AI chat, 
weekly check-ins and ongoing support. В App 
Store Premium описан как Berry AI chat + 
custom sleep plans + weekly progress check-
ins.
На лендинге продавать не “activities”, а 
“daily toolkit + SOS coach + adaptive insights 
+ weekly check-ins”.
Lovevery
App explicitly for parents/caregivers; stage-
based activities, expert advice, child 
development info, weekly curated content.
Позиционировать TinyPlan как app для 
родителей. Добавить “stage/age-
appropriate” и “right idea at the right 
moment”.
Kinedu
Daily personalized plans, step-by-step 
activities, guidance by age/development 
stage, expert positioning.
Показывать “exactly what to do today” + 
“matched to age, routine, goals”.
BabySparks
Personalized daily activity program, parent-
led activities, adaptive technology, 
milestones/articles/tracking.
Продавать adaptive loop: feedback changes 
tomorrow, progress shows patterns, library 
supports parent skills.
Источники для конкурентных принципов: Huckleberry App Store listing, Lovevery App pages/blog, Kinedu App Store/Google Play, BabySparks 
App Store/Google Play. См. раздел References в конце документа.
3. Новое позиционирование лендинга
Новая формула
TinyPlan is a 7-day parent toolkit for calmer days with your child.
Every day includes: one play moment, one parent skill, ready-to-use scripts, SOS support, and adaptive insights.
Было
Стало
“Personalized 7-day play plan”
“Parent toolkit: what to do, what to say, how to respond”
Одна игра в день
Daily toolkit: Play Moment + Parent Skill + Scripts + If It Gets Hard + 
Check-in
Фокус на ребёнка
Фокус на родителя: меньше хаоса, больше уверенности
Статичный список
Живая система: quiz -> plan -> daily feedback -> tomorrow adjusts
Просто контент
Coaching experience без видео: короткие уроки, сценарии, SOS, 
прогресс


# Page 3

TinyPlan landing rebuild spec - internal product brief
4. Главная психология конверсии
Лендинг должен провести пользователя через 5 ощущений:

“Это про меня”: показать реальные боли - screens, bedtime, transitions, no ideas, parent fatigue.

“Меня не осуждают”: no guilt, no perfect parenting, realistic small moments.

“Это умнее, чем Pinterest”: quiz builds a plan from age, routine, time, materials, parent goal.

“После оплаты там не пусто”: показать структуру Daily Toolkit, Week Path, SOS Coach, Library, Progress.

“Хочу увидеть свой план”: mini-preview, locked personal plan, $1 trial as low-risk unlock.
5. Новая структура лендинга - полный wireframe
Порядок
Секция
Цель
Что внутри
1
Header
Доверие и быстрый старт
Logo, “How it works”, “What you 
get”, “Pricing”, Login, CTA
2
Hero
В первые 5 сек. продать боль и 
результат
Strong headline, subheadline, 
CTA, trust chips, hero illustration 
+ UI card preview
3
Problem recognition
Чтобы родитель узнал себя
4 pain cards: screens, bedtime, 
transitions, no ideas
4
Product promise
Переключить с боли на 
систему
“Less guessing. More confident 
parenting.” + Daily Toolkit 
preview
5
What is inside each day
Показать paid value
5 карточек: Play Moment, Parent 
Skill, Scripts, SOS, Check-in
6
How TinyPlan personalizes
Доказать, что квиз не фикция
Age + routine + time + materials 
+ goal -> plan
7
Parent Growth Path
Продать возвращаемость 
завтра
7-day skill path: Small Control, 
Predictable Start...
8
SOS Coach
Показать emergency value
Ask TinyPlan + quick cards + 
sample conversation
9
Adaptive Insights
Продать retention
Feedback -> next plan 
adjustment -> weekly report
10
Library / Parent Tools
Показать глубину
Parent Skills, scripts, resets, no-
prep ideas, age filters
11
Safety & trust
Снять страхи
No diagnosis, no child data, no 
extra screen time, parent-first
12
Pricing / CTA
Конвертировать
$1 for 7 days, then 
$14.99/month, cancel anytime
13
FAQ
Снять возражения
Age range, time, materials, not 
therapy, cancel, privacy
14
Final CTA
Последний push
“Build my free plan” + trust chips
6. Above the fold: новый hero
Задача hero
Не “красиво рассказать”, а быстро объяснить: родителю станет легче сегодня вечером, потому что TinyPlan даст 
готовый дневной набор, слова и SOS-поддержку.
Рекомендуемый hero layout:

Desktop: слева текст/CTA, справа большой product mockup + emotional illustration. Не всё по центру.

Mobile: headline -> short subheadline -> CTA -> trust chips -> hero visual -> mini product card.

Hero visual должен быть не просто картинка семьи, а картинка + UI overlay: “Today’s Toolkit”, “Parent Skill”, 
“SOS”.

CTA всегда выше первого скролла: “Build my free plan”. Под ним: “3 minutes. No signup to start.”
Hero copy - вариант A:
English copy


# Page 4

TinyPlan landing rebuild spec - internal product brief
Headline:
Know what to do - and what to say - during the hard moments.
Subheadline:
TinyPlan builds a 7-day parent toolkit around your child’s age, your routine, and what feels hardest right now. Every day 
you get one play moment, one parent skill, scripts, and SOS support.
CTA:
Build my free plan
Microcopy:
Takes 3 minutes. No signup to start. Ages 2-6. No extra screen time.
Hero copy - вариант B:
English copy
Headline:
A calmer week with your child starts with one tiny plan.
Subheadline:
Get a personalized daily toolkit with play ideas, parent skills, exact words to say, and real-time help when the day goes 
sideways.
CTA:
Start the free quiz
7. Trust chips под CTA
Под CTA поставить 4-5 маленьких pill-чипов. Они должны нести доверие и снижать страхи.
Chip
Иконка
Зачем
Ages 2-6
calendar / child profile
Сразу понятно, кому подходит
No child diagnosis
shield
Снимает медицинский страх
No extra screen time
phone-off
Очень важно для родителей
Parent-first
heart/parent
Уточняет, что приложение для родителей
Cancel anytime
unlock/refresh
Снижает риск подписки
8. Блок боли: “Does this sound familiar?”
Этот блок должен идти сразу после hero или быть частью первого экрана на mobile. Он нужен, чтобы человек 
узнал себя и продолжил.
Section copy
Does this sound familiar?
You want calmer days, but real life gets messy fast.
Pain card
Icon
Text
Screens became the default
phone / screen-off
You want fewer screen battles, but need 
realistic alternatives that actually work.
Transitions turn emotional
arrows / timer
Leaving the park, stopping a show, starting 
bedtime - tiny moments can become huge.
You run out of play ideas
lightbulb
You do not need 100 ideas. You need the 
right next idea for today.
You feel unsure what to say
speech bubble
TinyPlan gives exact words for the moments 
where you usually freeze.


# Page 5

TinyPlan landing rebuild spec - internal product brief
9. Главная секция продукта: “What you get every day”
Это ключевая секция. Она должна доказать, что после оплаты пользователь не увидит “одну игру”, а 
полноценный набор дня.
Section headline
One complete parent toolkit, every day
Not just an activity. A small plan for what to do, what to say, and how to respond.
Card
Icon
Short copy
Play Moment
smile / blocks
A realistic activity matched to your child’s 
age, energy and available time.
Parent Skill
coach / speech
A tiny parenting move to practice today - like 
Small Control or Predictable Start.
Ready-to-use Scripts
chat bubble
Exact words for starting, resistance, big 
feelings and transitions.
If It Gets Hard
lifebuoy / refresh
Backup plan when your child says no, loses 
interest or melts down.
Tiny Check-in
check circle
Your feedback helps TinyPlan adjust 
tomorrow’s plan.
10. Product preview вместо одной скучной карточки
Сейчас example toolkit выглядит слабым. Надо показывать визуально раскрывающийся Daily Toolkit, 
желательно как mockup мобильного UI.
Секция должна выглядеть так:

Слева: короткий заголовок “Here is what today looks like”.

Справа или по центру: mobile mockup с карточками-аккордеонами: Play Moment, Parent Skill, Scripts, If It 
Gets Hard, Check-in.

В карточке Parent Skill видна не одна фраза, а 3-step move: Name the limit -> Name the feeling -> Offer two 
choices.

Под mockup: 3 chips: “7-10 min”, “low prep”, “age 5”.
UI mockup copy
Today’s Toolkit
Focus: Calmer transitions
1. Play Moment - Tiny City Choices
2. Parent Skill - Small Control
3. Scripts - What to say if they resist
4. If It Gets Hard - backup reset
5. Check-in - adjust tomorrow
11. Как работает персонализация
Нужно показать, что квиз не “опрос ради опроса”, а механизм сборки плана.
Input from quiz
Output in product
Child age
Age-appropriate activities and scripts; no reading-heavy tasks for 2-
year-olds
Hardest moment
Daily focus and SOS cards prioritized around that pain
Time available
3-min / 7-min / 15-min versions
Child style
Play profile: Curious Builder, Active Explorer, Routine Seeker, Story 
Starter
Parent obstacle
Adds backup cards: “child refuses”, “I’m too tired”, “no materials”
Materials at home
Filters activities to what the family can actually do
Feedback after day
Tomorrow’s plan changes: shorter, calmer, more active, no-prep


# Page 6

TinyPlan landing rebuild spec - internal product brief
Section copy
Built from your answers
TinyPlan uses your child’s age, your routine, available time, materials, and hardest moments to build a plan you can 
actually follow.
12. Parent Growth Path - новый сильный блок
Это должно стать одним из главных продающих блоков. Мы продаём не только “занять ребёнка”, а рост 
родителя: что делать и как реагировать.
Day
Parent skill
Landing copy
1
Small Control
Give one small choice when something 
cannot change.
2
Predictable Start
Make the next step clear with first / then / 
done.
3
Name Before Fixing
Help feelings settle before trying to solve.
4
Say Less, Show More
Use fewer words and more simple action.
5
Start Smaller
Make the first step so easy your child can 
join.
6
Calm Boundary
Hold the line without turning it into a lecture.
7
Repair & Repeat
Notice what worked and build your family 
rhythm.
Section headline
TinyPlan helps you build your parent toolkit
Each day teaches one small skill you can use beyond the activity - during bedtime, screen transitions, refusals and 
everyday chaos.
13. SOS Coach section
SOS должен быть очень заметным на лендинге, потому что это high perceived value: помощь в моменте.
Section copy
When the plan falls apart, TinyPlan stays useful
Ask what to say when screen time ends, bedtime explodes, your child refuses, or you are too tired to think.
Element
Content
Mini chat preview
Parent: “My child is melting down because screen time ended.” 
TinyPlan: “First, do not explain yet. Name the want, hold the 
boundary, offer one small choice.”
Quick SOS cards
Screen time ending, bedtime battle, says no, public meltdown, sibling 
conflict, parent needs a moment
Outcome
First 30 seconds, what to say, what not to do, tiny next step, adjust 
tomorrow?
14. Adaptive Insights + retention section
Чтобы подписка не отменилась, нужно показать, что TinyPlan учится и меняется, а не просто выдаёт 
статичный PDF.
Section copy
Your plan learns from what actually happens
After each tiny check-in, TinyPlan can make tomorrow shorter, calmer, more active, or easier to start.
Feedback
Visible adjustment
“Too hard”
Tomorrow will start with a shorter version and fewer steps.
“Child refused”
Tomorrow includes a gentler entry point and backup script.


# Page 7

TinyPlan landing rebuild spec - internal product brief
Feedback
Visible adjustment
“Loved it”
TinyPlan keeps the same play style and adds slight variety.
“I’m too tired”
Tomorrow prioritizes no-prep and parent-light activities.
SOS used twice for bedtime
Next week adds more bedtime transition support.
15. Library section: показать глубину продукта
На лендинге нужно объяснить, что Library - это не свалка игр, а структурированная база инструментов для 
родителя.
Library tab
What it contains
Icon
Activities
Age-appropriate play moments, no-prep 
ideas, indoor/outdoor, bedtime, movement
book / grid
Parent Skills
Small Control, Predictable Start, Calm 
Boundary, Repair After No, Start Smaller
coach / spark
Scripts
Exact words for transitions, refusals, screen 
ending, bedtime
chat bubble
3-Min Resets
Fast tools for hard moments when parent has 
no energy
timer
SOS Cards
Ready-made response flows for common 
difficult situations
life ring
16. Safety / trust section
Обязательно добавить. Родительская тема чувствительная. Нужно сразу снять риски.
Section headline
Built for real parents. Not medical advice. Not another screen for your child.
Trust point
Text
No diagnosis
TinyPlan does not diagnose, treat, or replace professional support.
Parent-first
The app is for the parent. Activities happen offline with your child.
No child data collected unnecessarily
Ask only what is needed to build the plan.
No guilt
Realistic moments, not perfect parenting.
Age-appropriate
Activities change based on age and attention span.
17. Pricing / final CTA section
Pricing должен не просто писать цену, а объяснять unlock value.
Pricing copy
Your personalized 7-day toolkit is ready after the quiz.
Start for $1 for 7 days. Then $14.99/month. Cancel anytime.
Includes: daily parent toolkit, age-appropriate activities, parent skill lessons, scripts, SOS coach, adaptive insights, and 
weekly check-ins.
CTA labels:

Primary: Build my free plan

Paywall after quiz: Start my 7-day plan - $1

Secondary: See how it works

Mobile sticky CTA: Build my plan
18. Новый английский landing copy - готово для вставки
Hero
Copy block


# Page 8

TinyPlan landing rebuild spec - internal product brief
Know what to do - and what to say - during the hard moments.
TinyPlan builds a 7-day parent toolkit around your child’s age, your routine, and what feels hardest right now. Every day 
you get one play moment, one parent skill, ready-to-use scripts, and SOS support.
[Build my free plan]
Takes 3 minutes. No signup to start. Ages 2-6. No extra screen time.
Problem section
Copy block
Real parenting does not need more pressure. It needs a next step.
Screens become the default. Bedtime stretches forever. Transitions turn emotional. You run out of play ideas. TinyPlan 
helps you move from “what do I do now?” to one small, doable plan.
Daily Toolkit section
Copy block
One complete toolkit, every day.
Each day includes a play moment for your child, a parent skill for you, exact words to say, a backup plan if it gets hard, 
and a tiny check-in that shapes tomorrow.
Personalization section
Copy block
Built from your answers.
Your child’s age, attention span, play style, your available time, materials, and hardest moments all shape the plan. That 
means a 2-year-old does not get the same plan as a 6-year-old, and a tired parent does not get a complicated setup.
Parent Growth section
Copy block
Build your parent toolkit one day at a time.
TinyPlan teaches small skills you can use beyond the activity: offering small choices, starting predictably, naming 
feelings, keeping boundaries calm, and repairing after a hard moment.
SOS section
Copy block
Support for the moment when the plan falls apart.
Ask TinyPlan what to say when screen time ends, bedtime gets chaotic, your child says no, or you are too tired to think. 
Get a calm first step, exact words, and a tiny next move.
Final CTA section
Copy block


# Page 9

TinyPlan landing rebuild spec - internal product brief
Less guessing. More confident parenting.
Start with a free quiz and unlock a personalized 7-day toolkit built around your real life.
[Build my free plan]
19. UI/UX: как лендинг должен выглядеть
Визуально лендинг должен быть premium-parenting/wellness, не “детский сад”. Больше иконок, иллюстраций, 
продуктовых mockups, но без перегруза.
UI element
Specification
Background
Warm cream (#FBF7F0) with soft section alternation (#F5EFE8 / 
white cards)
Primary color
Peach/coral (#E97957) for CTA and accents
Support colors
Sage, blush, lavender, muted gold for icon tiles and chips
Typography
Large bold headline, 44-64px desktop, 34-42px mobile; body 16-18px
Cards
White cards, 20-24px radius, subtle shadow, 1px warm border
Icons
Line icons in rounded color tiles; consistent stroke, not emoji
Illustrations
Warm minimal editorial, rectangular 4:3 or 16:9, not cartoonish
CTA
Large pill button, high contrast, sticky on mobile after first scroll
Mockups
Use product UI previews, not only generic family images
20. Обязательные иллюстрации и куда их ставить
Illustration
Where
Purpose
Landing hero family + plan
Hero right side / top mobile
Emotional hook: calm parent, child offline, 
plan visible
Daily Toolkit UI mockup
What you get section
Show product depth
Building your plan
Quiz/loading/landing personalization section
Show smart personalization
SOS calm moment
SOS section
Reduce anxiety and sell support
Parent Growth path
Parent Growth section
Show week progression
Progress/insights
Adaptive Insights section
Show retention and learning loop
Важно: иллюстрация должна быть дополнением к UI-preview. Для конверсии лучше всего работают 
скрин/карточка продукта + эмоциональная иллюстрация вместе.
21. Иконки: точная карта
Meaning
Icon idea
Color tile
Play Moment
smile / blocks / puzzle
peach
Parent Skill
speech bubble / coach / spark
blush
Scripts
chat bubble / quote
lavender
SOS
life ring / heart pulse
soft red/blush
Check-in
check circle
sage
Adaptive insights
lightbulb / chart
muted gold
Age-appropriate
calendar / child profile
sage
No extra screen time
phone-off
lavender
Privacy/safety
shield
sage
Cancel anytime
refresh / unlocked lock
peach
22. Mobile-first requirements

Первый экран mobile должен показывать headline, subheadline, CTA и хотя бы 2 trust chips без лишнего 
скролла.

Hero illustration на mobile должна быть ниже CTA, не занимать весь первый экран.

Фичи показывать в горизонтальном swipe carousel или stacked cards по 1 колонке.

Product preview сделать как phone mockup шириной 90% экрана.


# Page 10

TinyPlan landing rebuild spec - internal product brief

CTA sticky снизу после первого scroll: “Build my free plan”.

Не делать длинные абзацы: максимум 2-3 строки в одном текстовом блоке.

Safe area: не прятать CTA под Safari bottom bar; отступ снизу 96px для sticky кнопок.
23. Что удалить или заменить на текущем лендинге
Current issue
Fix
Hero слишком центрирован и статичен
Сделать split hero: text + CTA слева, product/illustration справа
Feature cards текстовые и слабые
Заменить на icon cards с конкретной пользой
Example toolkit слишком маленький
Показать раскрытый Daily Toolkit mockup
“What parents use TinyPlan for” выглядит как вторичный блок
Поднять боль выше и сделать более эмоционально
Нет “how it works”
Добавить 3-step flow: quiz -> personalized toolkit -> daily support
Нет safety/trust
Добавить trust section и chips
Footer pricing почти незаметен
Сделать отдельный pricing CTA section перед FAQ
Нет social proof
Для MVP добавить “Built for parents who...” вместо фейковых 
testimonials. Позже добавить реальные testimonials.
24. Секции, которые можно добавить позже (P1/P2)
Feature
Why it helps
Priority
Interactive sample toolkit
User opens accordion on landing and sees 
depth
P1
Before/after parent story
Emotional conversion, makes pain tangible
P1
Email capture for abandoned quiz
Retargeting and lifecycle
P2
Testimonials / beta quotes
Trust and proof
P1 after testing
Localized landing variants
Testing US/UK/ES/DE/FR markets
P2
A/B hero copy
Optimize conversion
P1
25. Claude Code / Herme: точное ТЗ по шагам
P0 - сделать сразу
1.
Пересобрать landing page по новой структуре: Header -> Hero -> Pain -> Daily Toolkit -> Personalization -> 
Parent Growth -> SOS -> Insights -> Library -> Trust -> Pricing -> FAQ -> Final CTA.
2.
Переделать hero из centered layout в split layout. Desktop: текст слева, product mockup/illustration справа. 
Mobile: CTA выше иллюстрации.
3.
Добавить sticky mobile CTA после первого scroll.
4.
Заменить 4 текущие feature cards на “What you get every day” с иконками: Play Moment, Parent Skill, Scripts, 
If It Gets Hard, Check-in.
5.
Добавить секцию “Built from your answers” с визуальной схемой quiz inputs -> personalized outputs.
6.
Добавить секцию Parent Growth Path с 7 навыками.
7.
Добавить секцию SOS Coach с mini chat preview.
8.
Добавить секцию Adaptive Insights с примерами feedback -> adjustment.
9.
Добавить safety/trust chips и trust section.
10. Добавить pricing CTA section и FAQ.
11. Везде заменить generic copy на тексты из раздела “English landing copy”.
12. Использовать consistent icons в rounded pastel tiles. Не использовать emoji.
13. Вставить иллюстрации только в ключевые секции, не в каждую карточку.
14. Оптимизировать mobile safe area: CTA не перекрывается Safari/Telegram browser UI.
P1 - после P0

Сделать интерактивный sample Daily Toolkit на лендинге: пользователь может открыть 1-2 accordion cards.

Добавить A/B hero copy variants.

Добавить реальный mockup paywall/result preview after quiz.

Добавить analytics events: hero CTA click, section scroll depth, FAQ open, pricing CTA click, quiz start.

Добавить testimonials после первых пользователей.


# Page 11

TinyPlan landing rebuild spec - internal product brief
26. FAQ - готовые тексты
Question
Answer
Is TinyPlan for my child or for me?
TinyPlan is for parents and caregivers. Your child does not need to 
use the app. You use it to get offline play ideas, scripts, and support.
What ages is it for?
TinyPlan is designed for ages 2-6. The quiz changes activities and 
scripts based on age and attention span.
Is this therapy or medical advice?
No. TinyPlan does not diagnose, treat, or replace professional advice. 
It gives practical parent support for everyday routines and hard 
moments.
Do I need special toys?
No. TinyPlan can build plans around what you already have: paper, 
blocks, books, kitchen items, or nothing special.
How much time do I need?
Most plans include 3-minute, 7-minute, and longer versions, 
depending on your quiz answers and feedback.
Can I cancel?
Yes. Start for $1 for 7 days, then $14.99/month. Cancel anytime.
Will this add screen time?
No. TinyPlan is for the parent. The activities are designed to happen 
offline.
27. Acceptance checklist

Первый экран за 5 секунд отвечает: what is it, who is it for, why should I care, what do I do next.

На mobile CTA виден до hero illustration или сразу после короткого subheadline.

Пользователь понимает, что после оплаты он получает Daily Toolkit, а не одну игру.

Есть минимум 3 proof points персонализации: age, routine, hardest moment, time/materials.

Есть секция Parent Growth: приложение для родителя, а не для ребёнка.

Есть SOS Coach: помощь в моменте.

Есть Adaptive Insights: план меняется после feedback.

Есть trust/safety: no diagnosis, no extra screen time, no shame.

В каждом крупном блоке есть иконка/визуал/mockup, но не перегруз.

Нет длинных текстовых стен. Один блок = одна идея.

Нет фейковых testimonials. Если нет реальных, не добавлять выдуманные.

Нет медицинских обещаний: “fix”, “treat”, “guarantee”, “diagnose”.
28. References / источники для продуктовой логики

Huckleberry App Store listing: describes free tracker, Plus features, Berry expert-vetted AI chat, custom sleep 
plans, weekly progress check-ins and ongoing support.

Lovevery App pages/blog: positions the app as for parents/caregivers, with stage-based activities, parenting tips, 
child development information and expert advice.

Kinedu App Store/Google Play: emphasizes personalized daily plans based on age/development stage, step-by-
step recommendations, guidance and expert positioning.

BabySparks App Store/Google Play: emphasizes personalized daily activity program, parent-led activities, smart 
adaptive technology, milestones and parenting support.
Примечание: TinyPlan не должен копировать контент/дизайн этих продуктов. Используем только проверенные product principles: 
personalization, daily plan, parent confidence, support, insights, retention loop.
