const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const axios = require("axios");
const PORT = process.env.PORT || 5556;
const BASE_URL = process.env.BASE_URL;
const multer = require("multer");
const upload = multer({ dist: "./upload" });
const fs = require("fs");

app.use(express.json());
app.use(cors());

const tokens = {};
app.post("/api/adduser", async (req, res) => {
  try {
    if (!tokens[req.body.data.user_email]) {
      const token = await axios.post(
        "https://bof.profchecksys.com/account/signin",
        { username: "yachine", password: "Profcheck123!" }
      );
      const result = await axios.post(
        "https://bof.profchecksys.com/account/signup",
        {
          firstName: "" + req.body.user_meta.first_name[0],
          lastName: "" + req.body.user_meta.last_name[0],
          username: "" + req.body.data.user_login,
          providerName: "Profcheck",
          role: {
            id: 1,
            name: "CUSTOMER",
          },
          password: req.body.user_meta.billing_passapp[0],
          userProfile: {
            organization: {
              id: 71,
            },
            email: "" + req.body.data.user_email,
            phone: "" + req.body.user_meta.billing_phone[0],
            providerName: "Profcheck",
          },
        },
        {
          headers: {
            Authorization: token.data.token,
          },
        }
      );
      if(result){
        const tokenUser = await axios.post(
          "https://bof.profchecksys.com/account/signin",
          {
            username: result.data.username||req.body.data.user_login,
            password: req.body.user_meta.billing_passapp[0],
          }
        );
        tokens[req.body.data.user_email] = tokenUser.data.token;
      }
    }
      res.send("ok");
  } catch (error) {
    console.log({ error });
    res.status(555).send("error");
  }
});
app.post(
  "/api/addcheck",
  express.urlencoded({ extended: true }),
  async (req, res) => {
    try {
      const { body } = req;
      let attachedFiles = [];
      if(body.attachedFiles.includes(' , '))body.attachedFiles.split(' , ').map((file,index)=>({name:"file number"+ index,content:file}))
      else attachedFiles = [{name:"file ",content:body.attachedFiles}]
      const json = {
        id: 0,
        name: "",
        parentId: null,
        parentName: "" + body.parentName,
        version: 0,
        uniqueId: "",
        title: "",
        idNumber: "0000000000000",
        createdDate: "",
        generalInfo: {
          id: 0,
          name: null,
          parentId: null,
          parentName: null,
          version: 0,
          firstName: "" + body.firstName,
          fullName: "",
          language: "Hebrew",
          simplePhone: body.phone,
          middleName: "" + body.middleName,
          lastName: "" + body.lastName,
          previousName: null,
          simpleAddress: "",
          simplePlaceOfBirth: "",
          dateOfBirth: null,
          placeOfBirth: null,
          address: null,
          email: "" + body.email,
          countryCallingCode: null,
          nationalCallingCode: null,
          imagePath: null,
          note: "" + body.note,
          urgentInspection: false,
          portrait: body.portrait,
          phone: "" + body.phone,
        },
        status: {
          id: 7,
          name: "close",
          parentId: 2,
          parentName: "InquiryStatusEnumEntity",
          version: 0,
        },
        parts: null,
        attachedFiles,
        organization: {
          id: 71,
          name: "הזמנות מהחנות",
          parentId: null,
          parentName: null,
          version: 0,
        },
        type: {
          id: body.typeid,
          name: body.form_name,
          parentId: 8,
          parentName: "INQUIRY_TYPE",
          version: 0,
          organization: {
            id: 71,
            name: "הזמנות מהחנות",
            parentId: null,
            parentName: null,
            version: 0,
          },
        },
        negativeInfo: false,
      };
      const response = await axios.post(
        "https://bof.profchecksys.com/inquiry",
        json,
        {
          headers: {
            Authorization: tokens[body.parentEmail],
          },
        }
      );
      res.send('ok');
    } catch (err) {
      console.log({ err });
      res.send("error");
    }
  }
);

app.listen(PORT, () => {
  if (!fs.existsSync("./upload")) fs.mkdirSync("./upload");
  console.log("listening on port " + PORT);
});
