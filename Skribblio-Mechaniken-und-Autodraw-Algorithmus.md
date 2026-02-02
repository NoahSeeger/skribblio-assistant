# Skribbl.io Mechaniken & Autodraw Algorithmus

## 1. Skribbl.io Zeichen-Mechaniken

### Farben
- Es gibt **genau 26 auswählbare Farben** (siehe Bild unten).
- Custom-Farben sind nicht möglich, nur die vorgegebenen Farben können verwendet werden.

### Tools
- **Brush**: 5 verschiedene Dicken (von dünn bis dick).
- **Fill Tool**: Füllt die gesamte Zeichenfläche mit einer Farbe.
- **Radierer**: Löscht Bereiche.
- **Stift**: Zeichnet Linien und Formen.

### Zeichenfläche
- Zeichnen erfolgt pixelbasiert, aber nur mit den verfügbaren Farben und Werkzeugen.

---

## 2. Autodraw Algorithmus: Einstellungen & Verhalten

### Color bits
- Steuert die Farbreduktion beim Bildimport.
- Beispiel: 8 Bits = 256 Farbabstufungen pro Kanal (RGB).
- In der Praxis werden die Farben auf die **nächste passende Skribbl.io-Farbe** gemappt (maximal 26 Farben).
- Es werden keine Custom-Farben verwendet.

### Batch by color
- **An:** Alle Bereiche einer Farbe werden nacheinander gezeichnet (weniger Farbwechsel, schneller).
- **Aus:** Das Bild wird zeilenweise (von oben nach unten, links nach rechts) gezeichnet, unabhängig von der Farbe. Es wird nicht nach innen/außen sortiert, sondern einfach der Bilddaten-Scan.

### Fill background
- Füllt die Zeichenfläche zuerst mit der dominanten Farbe des Bildes.
- Nutzt das **Fill Tool** von Skribbl.io, falls verfügbar.
- Spart Zeit, wenn der Hintergrund einfarbig ist.

### CORS proxy
- Ermöglicht das Laden von Bildern von externen Quellen, die sonst durch Browser-Sicherheitsregeln blockiert wären.

### Pen mode
- **Fast:** Nutzt größere Brush-Dicken für schnellere, grobe Zeichnung.
- **Accurate:** Nutzt kleinere Brush-Dicken für mehr Details.
- Die Brush-Dicke wird entsprechend der Einstellung im Algorithmus gesetzt (1-5).

### Scale
- **Fit:** Bild wird so skaliert, dass es komplett in die Zeichenfläche passt (Seitenverhältnis bleibt erhalten).
- **Fill:** Bild wird so skaliert, dass die gesamte Zeichenfläche ausgefüllt wird (Seitenverhältnis kann verzerrt werden).

---

## 3. Bild: Alle auswählbaren Skribbl.io Farben

![Skribbl.io Farben](screenshots/skribblio-colors.png)

---

## 4. Hinweise & ToDo
- Algorithmus und Mechaniken werden hier laufend aktualisiert.
- Weitere Details zu Brush, Fill, und Zeichenstrategie können ergänzt werden.
- Fragen, Vorschläge oder Änderungen bitte hier dokumentieren.

---

**Letzte Aktualisierung:** 02.02.2026
