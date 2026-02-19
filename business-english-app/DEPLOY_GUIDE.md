# BusinessEnglish Pro — Ghid Complet Deploy & Testare

---

## FAZA 1: Setup Local (30 min)

### 1.1 Prerequisite — Instaleaza pe calculatorul tau

- [ ] **Node.js 18+** — https://nodejs.org (recomand LTS)
- [ ] **Git** — https://git-scm.com
- [ ] **Expo CLI** — ruleaza: `npm install -g eas-cli`
- [ ] **Expo Go app** — instaleaza din App Store / Google Play pe telefon
- [ ] (Optional) **Xcode** — daca ai Mac si vrei simulator iOS
- [ ] (Optional) **Android Studio** — pentru emulator Android

### 1.2 Cloneaza si instaleaza

```bash
# Cloneaza repo-ul
git clone https://github.com/andreimilchis/library.git
cd library
git checkout claude/business-english-app-EvRD4
cd business-english-app

# Instaleaza dependentele
npm install
```

### 1.3 Verifica ca totul e OK

```bash
# TypeScript compileaza fara erori?
npx tsc --noEmit

# Trebuie sa nu arate nicio eroare
```

---

## FAZA 2: Testare Locala pe Telefon (10 min)

### 2.1 Porneste serverul de dezvoltare

```bash
npx expo start
```

Vei vedea un QR code in terminal.

### 2.2 Testeaza pe telefon fizic

| Platforma | Ce faci |
|-----------|---------|
| **iPhone** | Deschide Camera → scaneaza QR-ul → se deschide in Expo Go |
| **Android** | Deschide Expo Go app → Scan QR Code → scaneaza codul |

### 2.3 Testeaza pe simulator/emulator

```bash
# iOS (doar pe Mac cu Xcode instalat)
npx expo start --ios

# Android (cu Android Studio + emulator configurat)
npx expo start --android

# Web browser (pentru debug rapid)
npx expo start --web
```

### 2.4 Checklist testare manuala

**Onboarding Flow:**
- [ ] Welcome screen se incarca cu animatii hologram
- [ ] Pot introduce nume si rol
- [ ] Pot selecta industria
- [ ] Pot selecta nivelul de engleza
- [ ] Pot selecta multiple goals
- [ ] Pot selecta multiple pain points
- [ ] Summary screen arata datele corecte
- [ ] "Meet Your Holograms" duce la Dashboard

**Dashboard:**
- [ ] Salutul personalizat apare cu numele meu
- [ ] Cele 4 hologram cards se afiseaza corect
- [ ] Animatiile hologram functioneaza (pulse, glow)
- [ ] "Quick Session with Coach" functioneaza

**Conversatie:**
- [ ] Se deschide conversation screen
- [ ] Holograma trimite primul mesaj automat
- [ ] Pot scrie si trimite mesaje
- [ ] Holograma raspunde dupa 1-2 secunde
- [ ] Coach-ul da feedback la fraze slabe
- [ ] Key phrases apar si se pot folosi
- [ ] "End" termina sesiunea si arata rezultatele

**Session Results:**
- [ ] Score-urile se afiseaza cu bare animate
- [ ] "Practice Again" reporneste conversatia
- [ ] "Back to Dashboard" revine la dashboard

**Profile:**
- [ ] Toate datele onboarding apar corect
- [ ] Session history se actualizeaza
- [ ] Reset profile functioneaza

---

## FAZA 3: Cont Expo & EAS Setup (15 min)

### 3.1 Creaza cont Expo

```bash
# Creaza cont pe https://expo.dev (gratuit)
# Apoi logheaza-te:
npx eas login
```

### 3.2 Configureaza proiectul

```bash
# Initializeaza proiectul EAS (va genera un project ID)
npx eas init
```

Dupa aceasta comanda, actualizeaza `app.json`:
- Inlocuieste `YOUR_EAS_PROJECT_ID` cu ID-ul generat
- Inlocuieste `YOUR_EXPO_USERNAME` cu username-ul tau Expo

### 3.3 Verifica configuratia

```bash
npx eas config
```

---

## FAZA 4: Build Preview APK — Testeaza pe Android (20 min)

### 4.1 Fa build Android APK

```bash
# Genereaza un APK pe care il poti instala direct
npx eas build --platform android --profile preview
```

- Build-ul se face in cloud (gratuit, ~10-15 min)
- Vei primi un link de download cand e gata

### 4.2 Instaleaza pe telefon Android

1. Descarca APK-ul de pe link-ul primit
2. Trimite-l pe telefon (email, Google Drive, direct download)
3. Instaleaza (permite "Install from unknown sources" daca e nevoie)
4. Testeaza toata aplicatia

---

## FAZA 5: Build Preview iOS (20 min, necesita Mac)

### 5.1 Varianta A — Cu cont Apple Developer ($99/an)

```bash
# Build iOS pentru distributie interna
npx eas build --platform ios --profile preview
```

Trebuie sa inregistrezi device-ul tau:
```bash
npx eas device:create
```

### 5.2 Varianta B — Fara cont Apple Developer (simulator only)

```bash
# Build doar pentru simulator
npx eas build --platform ios --profile development
```

Fisierul .tar.gz rezultat se instaleaza in Xcode Simulator.

---

## FAZA 6: Deploy Production — App Store & Google Play

### 6.1 Android — Google Play Store

**Prerequisite:**
- [ ] Cont Google Play Developer ($25 one-time) — https://play.google.com/console
- [ ] Service Account JSON key (pentru upload automat)

**Pasi:**

```bash
# 1. Build production Android
npx eas build --platform android --profile production

# 2. Upload automat pe Google Play (internal testing)
npx eas submit --platform android --profile production
```

**Manual (alternativa):**
1. Descarca fisierul `.aab` de pe Expo
2. Google Play Console → Create app → "BusinessEnglish Pro"
3. Internal testing → Upload `.aab`
4. Adauga testeri (email-uri)
5. Testerii primesc link de instalare

### 6.2 iOS — App Store

**Prerequisite:**
- [ ] Cont Apple Developer ($99/an) — https://developer.apple.com
- [ ] Mac cu Xcode (pentru certificate)

**Pasi:**

```bash
# 1. Build production iOS
npx eas build --platform ios --profile production

# 2. Upload pe App Store Connect
npx eas submit --platform ios --profile production
```

**In App Store Connect:**
1. Creaza app-ul in App Store Connect
2. TestFlight → adauga testeri interni
3. Testerii primesc notificare si pot instala

---

## FAZA 7: TestFlight / Internal Testing (Distribuie la testeri)

### 7.1 Android — Google Play Internal Testing

1. Google Play Console → Internal testing
2. Adauga lista de email-uri ale testerilor
3. Publica release-ul intern
4. Testerii primesc email cu link de instalare din Play Store

### 7.2 iOS — TestFlight

1. App Store Connect → TestFlight
2. Adauga testeri interni (pana la 100, membri ai echipei)
3. Sau testeri externi (pana la 10,000, necesita review Apple)
4. Testerii instaleaza TestFlight app si apoi aplicatia ta

---

## FAZA 8: Publicare in Store-uri

### 8.1 Pregateste materialele

- [ ] **App icon** — 1024x1024px (fara transparenta pentru iOS)
- [ ] **Screenshots** — minim 2 per device size
  - iPhone 6.7" (1290x2796)
  - iPhone 6.5" (1284x2778)
  - Android phone (1080x1920 minim)
- [ ] **Descriere scurta** — max 80 caractere
- [ ] **Descriere completa** — max 4000 caractere
- [ ] **Privacy Policy URL** — obligatorie pentru ambele store-uri
- [ ] **Keywords** (iOS) — business english, negotiation, etc.
- [ ] **Category** — Education

### 8.2 Submit pentru review

**Google Play:**
- Review: ~1-3 zile
- Poti publica in etape: Internal → Closed → Open → Production

**App Store:**
- Review: ~1-2 zile (uneori cateva ore)
- Trebuie sa treci review-ul Apple (poate respinge daca lipseste ceva)

---

## Quick Reference — Toate Comenzile

```bash
# ===== DEVELOPMENT =====
npm install                              # Instaleaza dependente
npx expo start                           # Porneste dev server
npx expo start --ios                     # Porneste pe iOS simulator
npx expo start --android                 # Porneste pe Android emulator
npx expo start --web                     # Porneste in browser
npx tsc --noEmit                         # Verifica TypeScript

# ===== EAS SETUP =====
npm install -g eas-cli                   # Instaleaza EAS CLI
npx eas login                            # Logheaza-te in Expo
npx eas init                             # Initializeaza proiectul

# ===== BUILD =====
npx eas build --platform android --profile preview      # APK test
npx eas build --platform ios --profile development      # iOS simulator
npx eas build --platform android --profile production   # AAB production
npx eas build --platform ios --profile production       # IPA production

# ===== SUBMIT TO STORES =====
npx eas submit --platform android       # Upload pe Google Play
npx eas submit --platform ios            # Upload pe App Store

# ===== UPDATES (dupa publicare) =====
npx eas update --branch production       # OTA update fara rebuild
```

---

## Costuri Estimative

| Serviciu | Cost | Nota |
|----------|------|------|
| Expo / EAS Build | GRATUIT | 30 builds/luna pe plan free |
| Google Play Developer | $25 | one-time, pe viata |
| Apple Developer Program | $99/an | obligatoriu pentru App Store |
| Domeniu (privacy policy) | ~$12/an | obligatoriu pentru store-uri |
| **Total minim (Android only)** | **$25** | |
| **Total minim (iOS + Android)** | **$124 + $12** | |

---

## Ordinea Recomandata

```
1. npm install + npx expo start          ← testeaza pe telefonul tau (5 min)
2. Treci prin checklist-ul manual        ← asigura-te ca totul merge
3. npx eas login + npx eas init          ← setup cont Expo
4. eas build --android --profile preview ← APK pe telefon Android
5. Trimite APK la 2-3 prieteni           ← feedback initial
6. Fixeaza probleme gasite
7. eas build --production                ← build final
8. Submit pe Google Play (internal)      ← testeri oficiali
9. Submit pe App Store (TestFlight)      ← testeri iOS
10. Publica pe ambele store-uri          ← LAUNCH
```
