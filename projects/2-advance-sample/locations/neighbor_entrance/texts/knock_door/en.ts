export default {
  // Main event text
  stand_at_door: "You stand in front of your neighbor's door.",
  knock_sound: "*knock knock*",
  
  // Stranger level responses
  stranger_door_slightly: "The door opens slightly. A suspicious face peers out.",
  stranger_who_are_you: "'Who are you? What do you want?'",
  
  // Acquaintance level responses  
  acquaintance_door_opens: "The door opens. Your neighbor recognizes you.",
  acquaintance_what_brings: "'Oh, it's you. What brings you here?'",
  
  // Friend level responses
  friend_door_smile: "The door opens with a smile.", 
  friend_nice_to_see: "'Hey there! Nice to see you again!'",
  
  // Close friend level responses
  close_friend_door_warmly: "The door swings open warmly.",
  close_friend_come_in: "'My friend! Come in, come in!'",
  
  // Choice options
  choice_say_hello: "Say hello and chat",
  
  // Chat branch - Stranger path
  introduce_self: "Hello i'm %PLAYER_NAME% your new neighbor nice to meet you!",
  neighbor_introduction: "Hello %PLAYER_NAME% my name is %NEIGHBOR_NAME%, nice to meet you young man!",
  dinner_invitation: "My mom told me to come to present myself and invite you to join us on diner so we can meet our new neighboor.\nWould you be available tonight?",
  neighbor_acceptance: "Of course it would be a pleasure, I didn't really talk to previous neighbor!\nIt's nice to have friendly one for a change. See you tonight then",
  
  // Chat branch - Other paths
  pleasant_conversation: "You have a pleasant conversation with your neighbor.",
  warming_up: "They seem to warm up to you a bit more.",
  
  // Relationship upgrades
  friendship_forming: "You sense a real friendship forming!",
  close_friends_now: "You've become close friends with your neighbor!"
} as const;