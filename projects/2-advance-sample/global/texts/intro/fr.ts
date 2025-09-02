export default {
  welcome: `Bienvenue dans l'example avancé de VueVN !
Ce projet aide les développeurs de jeux à comprendre la structure du jeu.
Vous pouvez soit commencer à jouer directement soit en apprendre un peu sur le framework.`,
  start_adventure: "Commencer l'aventure",
  learn_more: "En savoir plus sur VueVN",
  powerful_engine: `VueVN est un moteur de visual novel puissant basé sur TypeScript.
Il est conçu pour imiter certaines fonctionnalités de Ren'Py.
Et pour être un moteur plus orienté code que le format Twine.`,
  supports_features: `Il supporte les histoires à embranchements, la logique personnalisée et les mini-jeux !
Même si vous pourriez faire un VN traditionnel avec, il est plutôt pensé pour faire des jeux sandbox.
Jeux avec une conception de monde ouvert et des événements qui s'y déroulent.`,
  read_or_start: "Vous pouvez maintenant lire à propos des raccourcis clavier ou commencer votre aventure.",
  learn_keybinding: "Apprendre les raccourcis clavier",
  keybinding: `Ce moteur de VN est pensé pour pouvoir jouer d'une seule main (main gauche uniquement, clin d'œil).
Vous pouvez utiliser Espace/Flèche Droite/E pour continuer.`,
  go_back: `Vous pouvez utiliser Flèche Gauche/A pour revenir en arrière dans l'historique.
Vous pouvez aussi utiliser les touches numériques pour faire des choix, c'est pourquoi il y a un numéro à gauche des choix.`,
  test_info: `Vous pouvez utiliser cette petite intro pour tester la fonctionnalité d'aller en arrière et en avant.
Comme le moteur est conçu pour un monde ouvert, revenir en arrière ne peut se produire que dans le contexte d'événements pour relire le texte avant un choix ou faire un autre choix.
Quand vous êtes en libre parcours entre les événements, revenir en arrière ne fait rien.`,
  skip_info: `Vous pouvez aussi maintenir Ctrl pour avancer rapidement jusqu'au prochain choix, mais vous ne pouvez pas passer les choix.`,
  demo_end: `À des fins de démonstration, après ce dialogue, l'événement se terminera et vous reviendrez à avant l'événement.
La boucle de jeu rejouera alors l'événement et vous amènera au début jusqu'à ce que vous choisissiez de commencer le jeu.`,
  start: `Parfait ! Commençons votre aventure.
Dans cet example, vous vous réveillerez dans votre chambre après avoir passé ce texte.
Vous serez libre de vous déplacer et de découvrir à votre rythme ce que le moteur peut faire.`
} as const;