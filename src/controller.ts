import { IncomingMessage, ServerResponse } from "http";
import { Pokemon, database } from "./model";
import { renderTemplate } from "./view";

export const getHome = async (req: IncomingMessage, res: ServerResponse) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.end(await renderTemplate("src/views/HomeView.hbs"));
};

export const getAllPokemon = async (
    req: IncomingMessage,
    res: ServerResponse,
) => {
    const url = new URL(req.url!, `http://${req.headers.host}`); // Use URL parsing
    const queryParams = url.searchParams;
    const typeFilter = queryParams.get("type");
    const sortBy = queryParams.get("sortBy");
    let pokemon: Pokemon[] = [];

    // Apply basic filtering if we have a `typeFilter`:
    if (typeFilter) {
        pokemon = database.filter((pokemon) => pokemon.type === typeFilter);
    } else {
        pokemon = database;
    }

    if (sortBy === "name") {
        pokemon = [...pokemon].sort((a, b) => a.name.localeCompare(b.name));
    }

    const contentType = req.headers["content-type"];
    const userAgent = req.headers["user-agent"];

    "application/x-www-form-urlencoded"

    if (userAgent?.includes("curl"))
    {
        res.statusCode = 201;
        res.setHeader("Content-Type", "application/json");
        res.end({pokemon: pokemon});
    }
    else {
        res.statusCode = 201;
        res.setHeader("Content-Type", "text/html");
        res.end(await renderTemplate("src/views/ListView.hbs", {pokemon: database}));
    }
    
    /*
    res.setHeader("Content-Type", "application/json");
    res.end(
    JSON.stringify({ message: "All Pokemon", payload: pokemon }, null, 2),
    */
    }

export const getOnePokemon = async (
    req: IncomingMessage,
    res: ServerResponse,
) => {
    const id = Number(req.url?.split("/")[2]);
    const foundPokemon = database.find((pokemon) => pokemon.id === id);

    if (!foundPokemon) {
        res.statusCode = 404;
        return res.end(
            JSON.stringify({ message: "Pokemon not found" }, null, 2),
        );
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(
        JSON.stringify(
            {
                message: "Pokemon found",
                payload: foundPokemon,
            },
            null,
            2,
        ),
    );
};

export const createPokemon = async (
    req: IncomingMessage,
    res: ServerResponse,
) => {
    const contentType = req.headers["content-type"];
    const userAgent = req.headers["user-agent"];

    const body = await parseBody(req);

    let newPokemon

    // if content type...
    if (contentType?.includes("json"))
    {
        newPokemon = JSON.parse(body)
    }
    else if (contentType?.includes("url")){
        newPokemon = Object.fromEntries(new URLSearchParams(body).entries());
    }

    if (userAgent?.startsWith("curl"))
    {
        // if pokemon valid.
        database.push({
        id: database.length + 1,
        name: newPokemon.name,
        type: newPokemon.type
      });

        res.statusCode = 201;
        res.statusMessage
        res.end(
            JSON.stringify(
                {
                    message: "Pokemon created",
                    payload: {id: database.length,
                        name: newPokemon.name,
                        type: newPokemon.type},
                },
                null,
                2,))
    }
    else
    {
        // If type and id valid.

        database.push({
            id: database.length + 1,
            name: newPokemon.name,
            type: newPokemon.type
          });
    
        res.statusCode = 303;
        res.setHeader("Location", "/pokemon");
        res.end();
    }
};

export const getNewForm = async (
    req: IncomingMessage,
    res: ServerResponse,) => {

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.end(await renderTemplate("src/views/NewFormView.hbs"));
};

const parseBody = async (req: IncomingMessage) => {
    return new Promise<string>((resolve) => {
        let body = "";

        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", () => {
            resolve(body);
        });
    });
};