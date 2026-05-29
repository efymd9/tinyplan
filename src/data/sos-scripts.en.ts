import type { SosScript } from "./sos-scripts";

export const SOS_SCRIPTS_EN: SosScript[] = [
  {
    id: 'screen_battle',
    title: 'Screen Time Ending',
    icon: 'phone',
    situation:
      'Your child keeps asking for more screen time and gets upset when it is time to stop.',
    firstThirtySeconds:
      'Stay calm and get to eye level before saying anything. Don\'t reach for the device yet — your presence comes first.',
    whatToSay:
      'The screen is going to sleep now. I know you want more, and that feels frustrating. Let\'s find something fun to do together. Would you like to draw or play with your cars?',
    whatNotToDo:
      'Don\'t grab the device away suddenly, raise your voice, or bargain for more minutes. Sudden removal makes the transition harder.',
    afterCalm:
      'Let them press the power button themselves. One small choice eases the shift from screen to the next thing.',
    tinyNextStep:
      'Move to something hands-on together: blocks, drawing, or helping you in the kitchen.',
  },
  {
    id: 'tantrum',
    title: 'Big Feelings',
    icon: 'heart',
    situation:
      'Your child is overwhelmed with big feelings right now and cannot hear reason.',
    firstThirtySeconds:
      'Get low, get quiet, get close. Don\'t try to talk yet — your calm presence is the anchor they need right now.',
    whatToSay:
      'I am right here with you. You are safe. I will wait with you until you feel better. There is no rush.',
    whatNotToDo:
      'Don\'t try to reason, explain, or fix the feeling while the wave is still crashing. Words don\'t land when they\'re flooded.',
    afterCalm:
      'When breathing slows, offer: "Would you like a hug or some space?" Then follow their lead.',
    tinyNextStep:
      'Offer water and suggest something physical: "Want to go splash our hands together?"',
  },
  {
    id: 'bedtime',
    title: 'Bedtime Struggles',
    icon: 'moon',
    situation:
      'Your child keeps getting out of bed or asking for one more thing. Bedtime stretches on and on.',
    firstThirtySeconds:
      'Lower the lights and slow your movements down. Your calm sets the pace — whisper and move slowly.',
    whatToSay:
      'We did our story and our song. Your body needs rest now. I love you and I will see you in the morning. Goodnight.',
    whatNotToDo:
      'Don\'t add extra steps, negotiate more activities, or threaten consequences about not sleeping. Each extra step rewards the stalling.',
    afterCalm:
      'Tuck them in warmly and say goodnight with quiet confidence. Lie beside them and breathe slowly and audibly — bodies sync up.',
    tinyNextStep:
      'Say: "Close your eyes and tell me three fun things we did today." Then go quiet and let sleep come.',
  },
  {
    id: 'public_place',
    title: 'Big Feelings in Public',
    icon: 'people',
    situation:
      'Your child is having big feelings in a shop, restaurant, or playground and you feel everyone watching.',
    firstThirtySeconds:
      'Get down to their level and speak quietly. Don\'t react to the audience — focus only on your child.',
    whatToSay:
      'I know this is hard right now. Let\'s go somewhere quieter together. I am not angry, I just want to help you feel better.',
    whatNotToDo:
      'Don\'t raise your voice, try to explain yourself to bystanders, or rush through the moment out of embarrassment.',
    afterCalm:
      'Move to a quieter space together. When they settle, name the feeling calmly before you move on.',
    tinyNextStep:
      'Take three big breaths together, then count something nearby: "Let\'s count the red things we can see."',
  },
  {
    id: 'child_refuses',
    title: 'When They Say No',
    icon: 'hand',
    situation:
      'Your child says no to everything: getting dressed, brushing teeth, leaving the house.',
    firstThirtySeconds:
      'Pause before reacting. Take one slow breath to reset your own body first.',
    whatToSay:
      'I hear you. You do not want to do this right now. You can choose: do it yourself, or I\'ll help you. Either way is fine.',
    whatNotToDo:
      'Don\'t repeat the instruction louder. Don\'t make it a battle of wills — nobody wins those.',
    afterCalm:
      'Make it playful: "I bet I can put my shoes on before you can!" A challenge works better than a demand.',
    tinyNextStep:
      'Offer two genuine choices and let them decide: "Red shirt or blue shirt? You pick."',
  },
  {
    id: 'parent_exhausted',
    title: 'When You Need a Moment',
    icon: 'battery',
    situation:
      'You have had a long day. Your patience is low and you need a quick reset for yourself.',
    firstThirtySeconds:
      'You are allowed to pause before responding. Name it to yourself: "I am running low right now, and that is okay."',
    whatToSay:
      'Tell your child: "I need a tiny break. I will be right back." Then step away for 60 seconds.',
    whatNotToDo:
      'Don\'t push through when you\'re running on empty — that\'s how snapping happens. Real breaks beat fake calm.',
    afterCalm:
      'Return and say: "I\'m back. Let\'s do something together." A simple, low-effort activity is enough.',
    tinyNextStep:
      'Put on an audiobook or give them a simple sensory task for 5 minutes while you breathe and reset.',
  },
  {
    id: 'sibling_conflict',
    title: 'Sibling Disagreements',
    icon: 'users',
    situation:
      'Your children both want the same thing and voices are rising. They want you to pick a side.',
    firstThirtySeconds:
      'Don\'t try to find out who started it. Both children need to feel heard before any solution.',
    whatToSay:
      'I can see you are both upset. I am going to help you work this out, but first let\'s all take a breath. Now, tell me one at a time: what happened?',
    whatNotToDo:
      'Don\'t pick a side, lecture about fairness, or make one child feel like the villain.',
    afterCalm:
      'Help them try a solution they both agree to: a timer for turns, or choosing separate activities for now.',
    tinyNextStep:
      'Do something together as a group: "Who wants to pick a game for all three of us?"',
  },
  {
    id: 'transition_meltdown',
    title: 'Time to Leave',
    icon: 'arrow',
    situation:
      'You need to leave somewhere fun and your child does not want to go. Goodbye feels impossible.',
    firstThirtySeconds:
      'Give one genuine warning — not a threat. "Two more minutes, then we leave." Then hold it.',
    whatToSay:
      'I can see how much fun you are having. We need to leave now. Let\'s pick one last thing, and then say bye-bye together.',
    whatNotToDo:
      'Don\'t keep delaying the departure or negotiating. Each delay teaches them that resistance works.',
    afterCalm:
      'Take their hand and start walking. Say bye-bye to the place together — it makes closing feel real.',
    tinyNextStep:
      'Give something to look forward to: "On the way home, let\'s count how many dogs we see."',
  },
];
