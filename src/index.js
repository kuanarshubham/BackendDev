import dbConnect from "./db/index.js";
import 'dotenv/config';
import app from "./app.js";

dbConnect()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`MONOGO CONNECTED AT INDEX AT PORT ${process.env.PORT || 8000}`);
    })

    app.on("error", (error) => {
        console.log("ERROR on INDEX: ", error);
        throw error;
    })
})
.catch((err) => {
    console.error("MONOGODB CONNECTION FAILED AT INDEX.JS");
});

