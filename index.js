import OpenAI from "openai";
import dotenv from "dotenv";
import promptSync from "prompt-sync";
import axios from "axios";
import {textToSpeech} from "./text_to_speach.js";
import  fs  from 'fs';
import { autoLogon} from './sb1sk-client.js'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPEN_WEATHER_API_KEY = process.env.OPEN_WEATHER_API_KEY;
const SB1SK_CLIENT_KEY = process.env.SB1SK_CLIENT_KEY;

// Setup OpenAI API
const openai = new OpenAI({apiKey: OPENAI_API_KEY});

function readFile(filename){
  return fs.readFileSync(filename,
      { encoding: 'utf8', flag: 'r' });
}


async function getCurrentWeather(args) {
  try {
    const { location, unit } = args; // the arguments can potentially be wrong, so be sure to handle errors
    const units = unit === 'fahrenheit' ? 'imperial' : 'metric';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=${units}&appid=${OPEN_WEATHER_API_KEY}`;
    const response = await axios.get(url);
    const data = response.data;
    return JSON.stringify({
      location: data.name,
      temperature: data.main.temp,
      unit: units === 'imperial' ? 'fahrenheit' : 'celsius'
    });
  } catch (error) {
    console.log(JSON.stringify(error))
    return JSON.stringify(error);
  }
}

async function Kundeoppslag(args) {
  try {
    const { navn } = args; // the arguments can potentially be wrong, so be sure to handle errors

    const url = `https://data.brreg.no/enhetsregisteret/api/enheter?navn=${navn}`;
    const response = await axios.get(url);
    const data = response.data;
    return JSON.stringify(data);
  } catch (error) {
    console.log(JSON.stringify(error))
    return JSON.stringify(error);
  }
}

async function opprettSak(args) {
  try {
    const { navn, orgnummer } = args; // the arguments can potentially be wrong, so be sure to handle errors
    const testOrgnummer = '959240574'
    const url = `http://localhost:42001/office/banking/raadgiverflate/organization/${testOrgnummer}/cases`;

    const token = await autoLogon(SB1SK_CLIENT_KEY)

    const response = await axios.post(url, {"navn": `${orgnummer}: ${navn}`}, {
      headers: {
        'X-SB1SKTOKEN': token,
        'Content-Type': 'application/vnd.sparebank1.v1+json; charset=utf-8',
        'X-CSRFToken' : '',
      }},
    )

    return JSON.stringify(response.data);
  } catch (error) {
    console.log(JSON.stringify(error))
    return JSON.stringify(error);
  }
}

async function opprettVirksomhetsbeskrivelse(args) {
  try {
    const { beskrivelse, orgnummer } = args; // the arguments can potentially be wrong, so be sure to handle errors
    const testOrgnummer = '959240574'
    const url = `http://localhost:42001/office/banking/raadgiverflate/organization/${testOrgnummer}/virksomhetsbeskrivelse`;

    const token = await autoLogon()

    const response = await axios.post(url, {"beskrivelse": beskrivelse}, {
      headers: {
        'X-SB1SKTOKEN': token,
        'Content-Type': 'application/vnd.sparebank1.v1+json; charset=utf-8',
        'X-CSRFToken' : '',
      }},
    )

    return JSON.stringify(response.data);
  } catch (error) {
    console.log(JSON.stringify(error))
    return JSON.stringify('Error fetching weather data. Service may be down.');
  }
}

async function opprettEgenkapital(args) {
  try {
    const { sakId, type, beløp } = args; // the arguments can potentially be wrong, so be sure to handle errors
    const url = `http://localhost:42001/office/banking/raadgiverflate/cases/${sakId}/equity`;

    const token = await autoLogon()

    const response = await axios.post(url, {"type": type, "beløp": beløp}, {
      headers: {
        'X-SB1SKTOKEN': token,
        'Content-Type': 'application/vnd.sparebank1.v1+json; charset=utf-8',
        'X-CSRFToken' : '',
      }},
    )

    return JSON.stringify(response.data);
  } catch (error) {
    console.log(JSON.stringify(error))
    return JSON.stringify(error);
  }
}

async function opprettKapitalbehov(args) {
  try {
    const { sakId, formål, beløp } = args; // the arguments can potentially be wrong, so be sure to handle errors
    const url = `http://localhost:42001/office/banking/raadgiverflate/cases/${sakId}/financing-need`;

    const token = await autoLogon()

    const response = await axios.post(url, {"formål": formål, "beløp": beløp}, {
      headers: {
        'X-SB1SKTOKEN': token,
        'Content-Type': 'application/vnd.sparebank1.v1+json; charset=utf-8',
        'X-CSRFToken' : '',
      }},
    )

    return JSON.stringify(response.data);
  } catch (error) {
    console.log(JSON.stringify(error))
    return JSON.stringify(error);
  }
}

async function hentRegnskap(args) {
  try {
    const { orgnummer } = args; // the arguments can potentially be wrong, so be sure to handle errors

    const url = `https://data.brreg.no/regnskapsregisteret/regnskap/${orgnummer}?%C3%A5r=2021&regnskapstype=SELSKAP`;
    const response = await axios.get(url);
    const data = response.data;
    return JSON.stringify(data);
  } catch (error) {
    console.log(JSON.stringify(error))
    return JSON.stringify(error);
  }
}

async function hentRoller(args) {
  try {
    const { orgnummer } = args; // the arguments can potentially be wrong, so be sure to handle errors

    const url = `https://data.brreg.no/enhetsregisteret/api/enheter/${orgnummer}/roller`;
    const response = await axios.get(url);
    const data = response.data;
    return JSON.stringify(data);
  } catch (error) {
    console.log(JSON.stringify(error))
    return JSON.stringify(error);
  }
}
function hentPrognose(args) {
  try {
    const { orgnummer } = args; // the arguments can potentially be wrong, so be sure to handle errors

    return JSON.stringify(readFile("./prognose.json"));

  } catch (error) {
    console.log(JSON.stringify(error))
    return JSON.stringify(error);
  }
}

async function hentPrescore(args) {
  try {
    const { orgnummer } = args; // the arguments can potentially be wrong, so be sure to handle errors

    //const url = `https://data.brreg.no/enhetsregisteret/api/enheter/${orgnummer}/roller`;
    //const response = await axios.get(url);
    //const data = response.data;
    return JSON.stringify({
      orgnummer: orgnummer,
      belop: 1000000});
  } catch (error) {
    console.log(JSON.stringify(error))
    return JSON.stringify(error);
  }
}


// Note: the JSON response may not always be valid; be sure to handle errors
const availableFunctions = {
  // only one function in this example, but you can have multiple
  get_current_weather: getCurrentWeather,
  Kundeoppslag:Kundeoppslag,
  hentRegnskap:hentRegnskap,
  hentRoller:hentRoller,
  hentPrescore:hentPrescore,
  hentPrognose:hentPrognose,
  opprettSak:opprettSak,
  opprettKapitalbehov:opprettKapitalbehov,
  opprettEgenkapital:opprettEgenkapital,
  opprettVirksomhetsbeskrivelse:opprettVirksomhetsbeskrivelse
};


const tools = [
  {
    type: "function",
    function: {
      name: "get_current_weather",
      description: "Get the current weather in a given city, e.g. San Francisco. Only use the city name's, not the state or country.",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "The city and state, e.g. Paris, London, San Fransisco. Only use the city name's, not the state or country.",
          },
          unit: { type: "string", enum: ["celsius", "fahrenheit"] },
        },
        required: ["location"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "Kundeoppslag",
      description: "Funksjonenen søker på bedrifter i norge og returnerer navn og organisajonsnummer på de bedriftene som inneholder det som ligger input  ",
      parameters: {
        type: "object",
        properties: {
          navn: {
            type: "string",
            description: "navnet på bedriften den skal søke opp.",
          },
        },
        required: ["navn"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "hentRegnskap",
      description: "Tar organisasjonsnummer som input og returnerer regnskapet for selskapet.",
      parameters: {
        type: "object",
        properties: {
          orgnummer: {
            type: "string",
            description: "Organisasjonsnummeret til selskapet",
          },
        },
        required: ["navn"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "hentRoller",
      description: "Tar organisasjonsnummer som input og returnerer alle roller og personer i selskapet",
      parameters: {
        type: "object",
        properties: {
          orgnummer: {
            type: "string",
            description: "Organisasjonsnummeret til selskapet",
          },
        },
        required: ["navn"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "hentPrescore",
      description: "Henter et beløp som kunden kan låne uten at et trengs store analyser. beløpet returneres i norske kroner",
      parameters: {
        type: "object",
        properties: {
          orgnummer: {
            type: "string",
            description: "Organisasjonsnummeret til selskapet",
          },
        },
        required: ["navn"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "hentPrognose",
      description: "henter selskapets prognose for neste fem år. Den returnerer prognosisert regnskapsdata for de neste fem årene",
      parameters: {
        type: "object",
        properties: {
          orgnummer: {
            type: "string",
            description: "Organisasjonsnummeret til selskapet",
          },
        },
        required: ["orgnummer"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "opprettSak",
      description: "Oppretter en ny sak i rådgivers saksbehandlingssystem. funksjonen returnerer iden på saken som ble opprettet. Hvis brukere spør om å opprette sak så hjelp dem med å fylle ut alt de trenger. De må ha kapitalbehov, egenkapital og virksomhetsbeskrivelse. Minn dem på dette dersom de ikke ber deg om å fikse det.",
      parameters: {
        type: "object",
        properties: {
          orgnummer: {
            type: "string",
            description: "Organisasjonsnummeret til selskapet",
          },
          navn: {
            type: "string",
            description: "Et informativt navn på saken",
          },
        },
        required: ["navn", "orgnummer"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "opprettVirksomhetsbeskrivelse",
      description: "Oppretter en ny virksomhetsbeskrivelse knyttet til en organisasjon.",
      parameters: {
        type: "object",
        properties: {
          orgnummer: {
            type: "string",
            description: "Organisasjonsnummeret til selskapet",
          },
          beskrivelse: {
            type: "string",
            description: "Virksomhetsbeskrivelsen som skal lagres.",
          },
        },
        required: ["orgnummer", "beskrivelse"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "opprettKapitalbehov",
      description: "Oppretter et kapitalbehov på en finansieringssak. Et kapitalbehov beskriver hva det ønskes kapital til og hvor penger det trengs.",
      parameters: {
        type: "object",
        properties: {
          sakId: {
            type: "string",
            description: "Id på saken det ønskes å opprette et kapitalbehov på",
          },
          formål: {
            type: "string",
            enum: ["BYGG_ANLEGG_OG_TOMTER", "DRIFTINVENTAR", "KJØRETØY", "UTBYGGING", "REFINANSIERING", "FINANSINVESTERING", "ANNET"],
            description: `Formål: "BYGG_ANLEGG_OG_TOMTER", BESKRIVELSE: "brukes på lånebehov som omhandler bygg anlegg og tomter. som man skal bruke selv"
Formål:"DRIFTINVENTAR",BESKRIVELSE: "Til investering av ting man trenger for å drifte bedriften"
Formål:"KJØRETØY",BESKRIVELSE: "Til investering av kjørestøy. Biler, båter alt sammen"
Formål:"UTBYGGING",BESKRIVELSE: "Brukes hvis det er snakk om byggeprosjekter som skal selges"
Formål:"REFINANSIERING",BESKRIVELSE: "Brukes hvis man skal refinansiiere lån eller andre finanseringe"
Formål:"FINANSINVESTERING",BESKRIVELSE: "Brukes hvis man skal kjøpe aksjer obligasjoner eller lignende"
Formål:"ANNET"v, BESKRIVELSE: "brukes til andre formål`,
          },
          beløp: {
            type: "number",
            description: "Beløpet som skal knyttes til formålet",
          },
        },
        required: ["sakId", "formål", "beløp"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "opprettEgenkapital",
      description: "Oppretter en egekapitalkilde på en finansieringssak. En egenkapitalkilde beskriver hva kunden kan stille med av egne midler",
      parameters: {
        type: "object",
        properties: {
          sakId: {
            type: "string",
            description: "Id på saken det ønskes å opprette et kapitalbehov på",
          },
          type: {
            type: "string",
            enum: ["INNSKUTT", "OVERSKUDD", "LÅN_FRA_ANDRE", "SALG_AV_EIENDELER", "TILSKUDD", "ANNET"],
            description: `Type: "INNSKUTT" , BESKRIVELSE:"Bedriften stiller med mye midler. Typisk egenkaptial"
Type: "OVERSKUDD", BESKRIVELSE:"Overskudd fra selskapet"
Type: "LÅN_FRA_ANDRE", BESKRIVELSE:"De har lånt penger fra andre"
Type: "SALG_AV_EIENDELER", BESKRIVELSE:"De har solgt noe de har eid"
Type: "TILSKUDD", BESKRIVELSE:"De har fått midler fra en tilskuddsordning"
Type: "ANNET", BESKRIVELSE:"alt annet"`,
          },
          beløp: {
            type: "number",
            description: "Beløpet som skal knyttes til egenkapitalkilden",
          },
        },
        required: ["sakId", "type", "beløp"],
      },
    },
  }
];

async function runQuery(query, messages) {
  // Step 1: add the question to the conversation messages
  messages.push({ role: "user", content: query });

  // Step 2: Create a loop until the model doesn't want to call any more tools
  while (true) {
    // Step 3: call the model with the conversation messages and tools
    const response = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: messages,
      tools: tools,
      tool_choice: "auto", // auto is default, but we'll be explicit
    });

    const responseMessage = response.choices[0].message;

    // Step 4: check if the model wanted to call a tool
    const toolCalls = responseMessage.tool_calls;
    if (responseMessage.tool_calls) {
      messages.push(responseMessage); // extend conversation with assistant's reply

      // Step 5: call the tools and add their responses to the conversation
      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        const functionToCall = availableFunctions[functionName];
        const functionArgs = JSON.parse(toolCall.function.arguments);
        console.log(`  - Calling tool`, functionName, 'with args', functionArgs);
        const functionResponse = await functionToCall(functionArgs);
        console.log("    ↳ :", `${functionResponse.toString().slice(0, 100)}...`);
        messages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: functionResponse,
        }); // extend conversation with function response
      }
    }
    else {
      console.log('Finished reasoning.');
      messages.push({
        role: responseMessage.role,
        content: responseMessage.content,
      });
      return responseMessage.content;
    }
  }
}

// Main function. Runs in a loop to allow multiple questions for a longer conversation
async function main() {
  const prompt = promptSync();
  const messages = [
    // The "system" role is used to provide the AI with context about itself to give it a personality
    { role: "system", content: "Du er en bedrevitende og nedlatende rådgiver som jobber i SpareBank 1 Østenforsolen og  som svarer litt i stilen til Luksusfellen. Bruk gjerne emojies i svarene. Men det er vitkig at du er sikker på selskapet du skal spørre om. Spør gjerne for å være sikker. Ikke bruk for mye ord i svarene, vær konsis og morsom. Hvis brukere spør om å opprette sak så hjelp dem med å fylle ut alt de trenger. De må ha kapitalbehov, egenkapital og virksomhetsbeskrivelse. Minn dem på dette dersom de ikke ber deg om å fikse det." },
    //{ role: "system", content: "Du rådgiver som jobber i SpareBank 1 Østenforsolen med finansiering for bedrifter, oppgaven din er å hjelpe rådgivere med å gjennomføre sine oppgaver. Dette går ut på å hente informasjon om bedrifter, gjøre analyser og vurderinger, og snakke med sakssystemet dems. Bruk gjerne emojies i svarene. Men det er vitkig at du er sikker på selskapet du skal spørre om. Spør gjerne for å være sikker. Ikke bruk for mye ord i svarene, vær konsis og morsom. Hvis brukere spør om å opprette sak så hjelp dem med å fylle ut alt de trenger. De må ha kapitalbehov, egenkapital og virksomhetsbeskrivelse. Minn dem på dette dersom de ikke ber deg om å fikse det." },
  ];
  while (true) {
    const query = prompt("Enter your query ('q' to quit): ");
    if (query.toLowerCase() === 'q') {
      console.log("Exiting...");
      rl.close();
      break;
    }
    const response = await runQuery(query, messages);
    console.log("Final response::", response);

    // Optional step: convert the response to speech and play it
    //await textToSpeech(openai, response);
  }
}


main().catch(console.error);
