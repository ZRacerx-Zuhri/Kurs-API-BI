let express = require("express");
let app = express();
let cors = require("cors");
let cheerio = require("cheerio");
const { default: axios } = require("axios");
const { response } = require("express");

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  let url =
    "https://www.bi.go.id/id/statistik/informasi-kurs/transaksi-bi/default.aspx";

  try {
    let Result = await axios.get(url);
    let $ = await cheerio.load(Result.data);
    let col = [];
    isFloat = ["Nilai", "Kurs Jual", "Kurs Beli"];
    exclude = ["Grafik"];

    result = {
      // status: status,
      // message: message,
      data: {
        // lastupdate: lastupdate,
        table: [],
      },
      // elapsedTime: response.elapsedTime
    };

    $(
      "#ctl00_PlaceHolderMain_g_6c89d4ad_107f_437d_bd54_8fda17b556bf_ctl00_GridView1 tr"
    ).each(function (i, tr) {
      var row = {};
      switch (i) {
        case 0: //untuk memisahkan index 0 (paling atas) adalah header
          $(tr)
            .find("th")
            .each(function (j, th) {
              col.push($(th).text().trim());
            });
          break;
        default:
          $(tr)
            .find("td")
            .each(function (j, td) {
              if (exclude.indexOf(col[j]) !== -1) {
                //kalau field graph maka di-skip
                return true;
              }

              if (isFloat.indexOf(col[j]) !== -1) {
                var match = $(td).text().trim();
                // console.log(match);
                //   .match(/[0-9,.]*/);
                if (match !== null) {
                  row[col[j]] = match;
                  //row[col[j]] = parseFloat(match[0].replace(/,/g, "")); //menghilangkan format digit grouping
                } else {
                  row[col[j]] = parseFloat(match); //parsing ke Float
                }
              } else {
                row[col[j]] = $(td).text().trim();
              }
            });
          result.data.table.push(row);
          break;
      }
    });

    res.send(result).status(200);
  } catch (error) {
    console.log(error);
    res
      .send({
        status: "Failed",
        message: "We've encountered an error: " + error,
      })
      .status(500);
  }
});

app.listen(3003, () => {
  console.log("Connect..... 30003");
});
