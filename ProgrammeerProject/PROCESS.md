# Day 1
* Proposal geschreven en ingeleverd

# Day 2
* Extra data gezocht
* Begonnen aan design document

# Day 3
* Scraped http://www.gunpolicy.org/ voor meer data
* Sketches gemaakt voor het design document
* Verder gewerkt aan design document

# Day 4
* Design document afgemaakt
* Python script geschreven om de data in JSON formaat te stoppen voor D3
* Deel van de HTML en CSS geschreven, de kaart van de USA staat er in

# Day 5
* HTML + CSS afgemaakt, prototype is gemaakt
* Basis gelegd voor javascript code, navigatie tussen de twee visualisaties is nu mogelijk

# Day 6
* Layout veranderd na aanleiding van advies tijdens de presentaties vrijdag, beide visualisatie zullen nu op het scherm te zien zijn
* Data wordt nu geladen door middel van XMLHttpRequest
* Eerste werkende javascript code geschreven

# Day 7
* Kleuren voor de datamap gekozen
* Alle variabelen kunnen nu worden gevisualiseerd op de kaart
* Enkele outliers uit de data gehaald zodat de data beter gevisualiseerd wordt

# Day 8
* Legenda gemaakt voor de kaart
* Tooltips gemaakt voor de kaart
* Enkele problemen opgelost met data die in omgekeerde volgorde wordt opgehaald

# Day 9
* Besloten om Chart.js te gebruiken voor het maken van stijlvolle grafieken: http://www.chartjs.org/
* Het klikken op een staat laat nu een grafiek zien naast de kaart, de grafiek visualiseert data van de betreffende staat en variabele over alle jaren waarvoor de data beschikbaar is

# Day 10
* Begonnen aan een venster aan de zijkant van de kaart waar je states kunt selecteren die je met elkaar wil vergelijken. De vergelijking gaat op dezelfde plek worden weergegeven als de lijngrafiek, alleen dan als staafgrafiek en niet over alle jaren.

# Day 11
* Barchart toegevoegd
* Pijl navigatie toegevoegd om makkelijker door de tijd te navigeren
* Staten vergelijken kan nu
* test.html toegevoegd om te testen met hogere en lagere resoluties (door middel van een iframe)

# Day 12
* Er is nu een 'select all' knop voor het selecteren van staten
* Veel kleine bugs gefixt (zoals een onnodige animatie bij het switchen naar een andere grafiek)

# Day 13
* Nieuwe data opgezocht over politiek landschap in de states
* Cook PVI toegevoegd aan de visualisatie
* Cook PVI is een variabele met negatieve nummers en de stappen in de tijd zijn 4 jaar ipv 1 jaar, om deze data goed te visualiseren moet ik veel extra code schrijven speciaal voor deze variabele.

# Day 14
* Cook PVI wordt nu goed gevisualiseerd, met extra kleur in de grafieken om een duidelijker beeld te scheppen

# Day 15
* Besloten om Cook PVI apart te visualiseren zodat de grafiek makkelijker gecustomized can worden.
