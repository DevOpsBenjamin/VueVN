export default {
  welcome: `Willkommen zum VueVN erweiterten Beispiel!
Dieses Projekt hilft Spielentwicklern, die Struktur des Spiels zu verstehen.
Du kannst entweder direkt anfangen zu spielen oder etwas über das Framework lernen`,
  start_adventure: "Das Abenteuer beginnen",
  learn_more: "Mehr über VueVN erfahren",
  powerful_engine: `VueVN ist eine mächtige TypeScript-basierte Visual Novel Engine.
Sie ist gebaut, um einige Ren'Py Funktionen zu imitieren.
Sie ist darauf ausgelegt, eine mehr code-orientierte Engine als das Twine Format zu sein`,
  supports_features: `Sie unterstützt verzweigte Handlungsstränge, eigene Logik und Mini-Spiele!
Auch wenn du eine traditionelle VN damit machen könntest, ist sie mehr für Sandbox-Spiele gedacht.
Spiele mit einem offenen Welt-Konzept und Ereignissen darin.`,
  read_or_start: "Du kannst jetzt über Tastenbelegungen lesen oder dein Abenteuer starten.",
  learn_keybinding: "Über Tastenbelegungen lernen",
  keybinding: `Diese VN Engine ist darauf ausgelegt, mit nur einer Hand spielbar zu sein (nur linke Hand, zwinkerzwinkern).
Du kannst Leertaste/Rechts Pfeil/E benutzen, um vorwärts zu gehen.`,
  go_back: `Du kannst Links Pfeil/Q benutzen, um in der Geschichte zurück zu gehen.
Du kannst auch Zahlentasten benutzen, um Entscheidungen zu treffen - deshalb gibt es eine Nummer links.`,
  test_info: `Du kannst diese kurze Einführung benutzen, um die Zurück- und Vorwärts-Funktionalität zu testen.
Da die Engine für offene Welt-Spiele gebaut ist, kann das Zurückgehen nur in Ereignis-Kontexten passieren, um Text vor Entscheidungen nochmal zu lesen oder andere Entscheidungen zu treffen.
Wenn du frei zwischen Ereignissen herumläufst, macht Zurückgehen nichts.`,
  skip_info: `Du kannst auch Strg halten, um bis zur nächsten Entscheidung zu springen, aber du kannst nicht über Entscheidungen springen.`,
  demo_end: `Für Demo-Zwecke wird nach diesem Dialog das Ereignis enden und du wirst zu vor dem Ereignis zurückkehren.
Die Spiel-Schleife wird dann das Ereignis wiederholen und dich zum Anfang bringen, bis du wählst, das Spiel zu beginnen.`,
  start: `Großartig! Lass uns dein Abenteuer beginnen.
In diesem Beispiel wirst du in deinem Schlafzimmer nach diesem Text aufwachen.
Du wirst frei herumlaufen und in deinem eigenen Tempo entdecken können, was die VN Engine kann.`
} as const;