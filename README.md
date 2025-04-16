# Restaurangsida

En restaurangsida med React frontend och blockchain backend. Detta projekt använder Hardhat för smart contract-hantering och Vite som React utvecklingsmiljö.

## 🍽️ Projektöversikt

Detta system gör det möjligt för restaurangbesökare att:

- Boka bord online med MetaMask-verifierade transaktioner
- Välja mellan två sittningar (18:00 och 21:00)
- Kontrollera tillgänglighet baserat på datum och antal gäster

Systemet använder också ett administratörsgränssnitt för restaurangpersonal för att:

- Hantera bokningar (skapa, visa, redigera, ta bort)
- Se statistik över tillgängliga bord
- Hantera restauranginformation

## 🚀 Installationsguide

### Förutsättningar

- Node.js (v14 eller senare) installerat
- MetaMask-tillägg installerat i din webbläsare
- Git (för att klona projektet)

### Steg för att sätta upp projektet

#### 1. Starta blockkedjan

Navigera först till blockchain-mappen:

```shell
cd blockchain
```

Starta en lokal Hardhat-nod:

```shell
npx hardhat node
```

Håll detta terminalfönster öppet! Detta kör en lokal blockkedja.

#### 2. Distribuera smart contract

Öppna en ny terminal och navigera till blockchain-mappen:

```shell
cd blockchain
```

Kör setup-skriptet för att distribuera kontraktet:

```shell
npm run setup
```

Detta skript kommer att:

- Distribuera smart contract till din lokala blockkedja
- Skapa en restaurangentitet i kontraktet
- Visa kontraktadressen som ska användas i frontend

#### 3. Konfigurera frontend

Skapa eller uppdatera `.env`-filen i frontend-mappen med kontraktadressen:

```
VITE_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

#### 4. Konfigurera MetaMask

1. Öppna MetaMask i din webbläsare
2. Klicka på nätverksmenyn längst upp
3. Välj "Lägg till nätverk" eller "Lägg till nätverk manuellt"
4. Ange följande information:
   - Nätverksnamn: Hardhat Local
   - RPC URL: http://127.0.0.1:8545/
   - Kedja-ID: 31337
   - Valutasymbol: ETH
5. Klicka på "Spara"
6. Importera ett konto:
   - Klicka på kontoikonen
   - Välj "Importera konto"
   - Välj "Privat nyckel" och klistra in hardhat privatnyckel. Exempelvis: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - Klicka på "Importera"

#### 5. Starta frontend-applikationen

Navigera till projektets rotmapp och starta frontend-servern:

```shell
cd frontend
npm install
npm run dev
```

## 📱 Användningsguide

### Startsida (Home)

Startsidan är det första som möter användaren och presenterar restaurangens koncept:

1. Elegant header med restaurangens namn och navigationsmeny
2. Hero-sektion med välkomnande bild och text som förmedlar restaurangens atmosfär
3. Presentation av restaurangens koncept och kulinariska inriktning
4. Visuella inslag som framhäver maten och miljön
5. Direktlänk till bokningssidan för att göra det enkelt att boka bord
6. Responsiv design som fungerar väl på alla enheter

### Kontaktsida

Kontaktsidan innehåller all information som gäster behöver för att kontakta restaurangen:

1. Restaurangens adress och kontaktuppgifter (telefon, e-post)
2. Öppettider med tydlig presentation av både lunch- och middagssittningar
3. Karta som visar restaurangens placering
4. Kontaktformulär för frågor eller specialförfrågningar
5. Information om parkering och kollektivtrafik
6. Länkar till restaurangens sociala medier

### Bokning av bord (kundvy)

1. Gå till bokningssidan via navigationsfältet
2. Välj antal personer, datum och tid (18:00 eller 21:00)
3. Klicka på "Kontrollera tillgänglighet"
4. Om bord finns tillgängliga, fyll i personuppgifter
5. Godkänn GDPR-villkor
6. Klicka på "BOKA BORD"
7. Godkänn MetaMask-transaktionen när du uppmanas
8. Vänta på bekräftelse av bokningen

### Förhindrande av dubbelbokningar

- Systemet kontrollerar om en bokning med samma namn eller samma datum och tid finns
- Om en dubblettbokning upptäcks, stoppas processen och ett felmeddelande visas

### Administrering av bokningar (personalvy)

1. Gå till admin-sidan via navigationsfältet
2. Visa alla bokningar med statistik
3. Skapa, redigera eller ta bort bokningar
4. Filtrera bokningar via sökfältet
5. Kontrollera tillgängliga bord för olika datum

## 🧩 Teknisk information

### Teknologier

- **Frontend**: React, Vite, React Router
- **Backend**: Ethereum blockchain (Hardhat)
- **Smarta kontrakt**: Solidity
- **Plånboksintegration**: MetaMask, ethers.js
- **Stilar**: CSS med responsiv design

### Arkitektur

Systemet använder en kombination av blockchain och lokal lagring:

- Alla bokningar sparas primärt i blockchain
- Lokalt lagras även kopior för bakåtkompatibilitet
- Transaktioner kräver MetaMask-godkännande
- Boknings-ID genereras från transaktionshash

## ⚠️ Viktigt att tänka på

- Du måste ha MetaMask installerat och konfigurerat för att systemet ska fungera
- Den lokala blockkedjan måste vara igång före användning av systemet
- Om du stänger av din lokala blockkedja kommer all data att försvinna
- Systemet kräver bekräftelse för alla transaktioner via MetaMask

## 🔍 Felsökning

- **Problem med MetaMask-anslutning**: Kontrollera att du är ansluten till rätt nätverk (Hardhat Local)
- **Transaktioner misslyckas**: Se till att du har tillräckligt med ETH i ditt konto (du bör ha 10000 ETH i testkontot)
- **Frontend kan inte ansluta**: Kontrollera att .env-filen innehåller rätt kontraktadress
- **Data saknas**: Kontrollera att din lokala Hardhat-nod fortfarande körs
