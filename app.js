require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const getStream = require("get-stream");
const mongoose = require("mongoose");
const _ = require("lodash");
const xl = require("excel4node");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());




/* mongoose.connect("mongodb://localhost:27017/flohmarktDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}); */

/* mongoose.connect("mongodb://mongo:27017/flohmarktDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String,
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

const flohmarktSchema = new mongoose.Schema({
  flohmarktId: Number,
  flohmarktBezeichnung: String,
  datum: Date,
  ownerID: String,
  userEmails: [String],
});
const Flohmarkt = mongoose.model("Flohmarkt", flohmarktSchema);

const verkaeuferSchema = new mongoose.Schema({
  vorname: String,
  nachname: String,
  email: String,
  vNummer: Number,
  aktiv: Boolean,
  aktivToggled: Boolean,
  userId: Number,
});
const Verkaeufer = mongoose.model("Verkaeufer", verkaeuferSchema);

const artikelSchema = new mongoose.Schema({
  name: String,
  verkaeufer: String,
  nummer: Number,
  preis: Number,
});
const Artikel = mongoose.model("Artikel", artikelSchema);

const bonSchema = new mongoose.Schema({
  vorgang: Number,
  datum: Date,
  kundenabschluss: Boolean,
  artikel: [artikelSchema],
  summe: Number,
  kasse: Number,
  flohmarktId: Number,
});
const Bon = mongoose.model("Bon", bonSchema);

const auswertungSchema = new mongoose.Schema({
  vNummer: Number,
  nachname: String,
  vorname: String,
  artikel: [artikelSchema],
  summe: Number,
  flohmarktId: Number,
});
const Auswertung = mongoose.model("Auswertung", auswertungSchema); */

app.get("/", async function (req, res) {
  res.render("etiketten", { flohmarktBezeichung: "" });
});


/* app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function (err) {
    if (err) {
      console.log(err); 
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/etiketten");
      });
    }
  });
}); */


app.get("/etiketten", function (req, res) {
  res.render("etiketten", { flohmarktBezeichung: "" });
});
app.post("/etikettenErstellen", async function (req, res) {
  etikettenMake(req, res);
  //res.redirect("/etiketten");//später rausnehmen
});





app.listen(7003, function () {
  console.log("Server started on port 7003");
});


function etikettenMake(req, res) {
  const keys = [
    50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750,
    800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250, 1300, 1350, 1400,
    1450, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500,
    2600, 2700, 2800, 2900, 3000, 11111,
  ];
  const wieOft = Object.values(req.body);
  let zahlenArray = wieOft.map(function (x) {
    return parseInt(x, 10);
  });
  const vNo = zahlenArray[0];
  zahlenArray.shift();

  var wertAnzahlObjekt = {};
  keys.forEach((key, i) => (wertAnzahlObjekt[key] = zahlenArray[i]));

  const anzahlEtiketten = _.sum(zahlenArray);
  const seiten = Math.ceil(anzahlEtiketten / 6);
  console.log(wertAnzahlObjekt[11111]);
  let freieEtiketten = anzahlEtiketten % 6;
  if (wertAnzahlObjekt[11111] >= freieEtiketten) {
    wertAnzahlObjekt[11111] = wertAnzahlObjekt[11111] - freieEtiketten;
  }
  console.log(anzahlEtiketten);
  const doc = new PDFDocument({ size: "A4", autoFirstPage: false });
  doc.pipe(res);

  //doc.pipe(fs.createWriteStream("./file-table2.pdf"));
  doc.registerFont("Barcode Font", "public/fonts/barcodefont_alt.ttf");

  // Verkauefernummer

  const etiWidth = 175;
  const etiHeight = 115;
  const marginTB = 40;
  const marginLR = 35;
  //doc.fontSize(20).text(vNo, 90,45)

  // doc.fontSize(20).text(vNo, marginLR+62, 45+etiHeight*i)
  let l = 0;
  do {
    doc.addPage();
    let zeilenNochPlatz = 6;
    let naechsteReihe = 1;
    var i = 0;
    do {
      //Außenrahmen
      doc
        .lineWidth(1.8)
        .rect(marginLR, marginTB + etiHeight * i, etiWidth, etiHeight)
        .stroke();
      doc
        .lineWidth(1.8)
        .rect(
          etiWidth + marginLR,
          marginTB + etiHeight * i,
          etiWidth,
          etiHeight
        )
        .stroke();
      doc
        .lineWidth(1.8)
        .rect(
          2 * etiWidth + marginLR,
          marginTB + etiHeight * i,
          etiWidth,
          etiHeight
        )
        .stroke();
      //Innenrahmen 1
      doc
        .lineWidth(1)
        .rect(marginLR, marginTB + 22 + etiHeight * i, etiWidth, 22)
        .stroke();
      doc
        .lineWidth(1)
        .rect(etiWidth + marginLR, marginTB + 22 + etiHeight * i, etiWidth, 22)
        .stroke();
      doc
        .lineWidth(1)
        .rect(
          2 * etiWidth + marginLR,
          marginTB + 22 + etiHeight * i,
          etiWidth,
          22
        )
        .stroke();
      //Innenrahmen 2
      doc
        .lineWidth(1)
        .rect(marginLR, marginTB + 65 + etiHeight * i, etiWidth, 50)
        .stroke();
      doc
        .lineWidth(1)
        .rect(etiWidth + marginLR, marginTB + 65 + etiHeight * i, etiWidth, 50)
        .stroke();
      doc
        .lineWidth(1)
        .rect(
          2 * etiWidth + marginLR,
          marginTB + 65 + etiHeight * i,
          etiWidth,
          50
        )
        .stroke();

      i += 1;
    } while (i < 6);

    k = 0;

    let preisReihe = [11111, 11111, 11111, 11111, 11111, 11111];

    for (const [key, value] of Object.entries(wertAnzahlObjekt)) {
      if (naechsteReihe < 7) {
        if (value > 0) {
          if (value <= zeilenNochPlatz) {
            console.log("value <= zeilenNochPlatz");
            for (let index = 0; index < value; index++) {
              preisReihe[naechsteReihe - 1] = parseInt(key);
              wertAnzahlObjekt[key]--;
              //console.log("key value: " + key + "Value: "+ value);
              zeilenNochPlatz--;
              naechsteReihe++;
            }

            //console.log(preisReihe);
            //console.log(zeilenNochPlatz);
            //console.log("Value: " + key+" Zeilen platz: "+zeilenNochPlatz);
          } else if (zeilenNochPlatz > 0) {
            for (let index = 0; index < zeilenNochPlatz; zeilenNochPlatz--) {
              preisReihe[naechsteReihe - 1] = parseInt(key);
              wertAnzahlObjekt[key]--;
              naechsteReihe++;
            }
            console.log(
              "Noch " + zeilenNochPlatz + " Platz aber nicht genug für alle"
            );
          }
        }
      } else {
        //console.log("Wenn noch weitere Etiketten, dann neue Seite. ansonsten fertig");
      }
    }

    do {
      let j = 0;
      do {
        //das funktioniert
        doc
          .fontSize(19)
          .font("Helvetica")
          .text(vNo, marginLR + 65 + etiWidth * k, 45 + etiHeight * j);
        //wenn in der nächsten Zeile am Ende statt der 71 eine höhere Zahl steht,
        //zerschießt sich das rechts erstellte PDF
        doc
          .fontSize(15)
          .font("Helvetica")
          .text("Größe:", marginLR + 6 + etiWidth * k, 69 + etiHeight * j);
        j += 1;
      } while (j < 6);

      for (let index = 0; index < 6; index++) {
        if (preisReihe[index] != 11111) {
          console.log("jetzt");
          doc
            .fontSize(17)
            .text(
              String((preisReihe[index] / 100).toFixed(2)).replace(".", ",") +
              " €",
              100 + etiWidth * k,
              88 + 115 * index
            )
            .font("Helvetica");
        } else {
          doc
            .fontSize(15)
            .font("Helvetica")
            .text("Preis:", marginLR + 6 + etiWidth * k, 88 + 115 * index);
        }
      }

      for (let index = 0; index < 6; index++) {
        if (preisReihe[index] != 11111) {
          doc
            .fontSize(30)
            .font("Barcode Font")
            .text(
              "*" +
              String(vNo) +
              String(_.padStart(preisReihe[index], 4, "0")) +
              "*",
              60 + etiWidth * k,
              115 + 115 * index,
              {
                lineBreak: false,
              }
            );
        }
      }

      k += 1;
    } while (k < 3);
    l += 1;
  } while (l < seiten);
  // end and display the document in the iframe to the right

  doc.end();

  //A4 610*760
}

