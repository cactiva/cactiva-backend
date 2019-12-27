
import { Controller, Get } from "@overnightjs/core";
import { Request, Response } from "express";
const db = require("../db").default;



@Controller("api/db")
export class DbController {
    @Get("structure")
    private async structure(req: Request, res: Response) {
        const table = req.query.table;
        if (table) {
            const where = `${table ? `where tc.table_name = '${table}' or ccu.table_name = '${table}'` : ''}`;
            const r = await db.any(`${structureQuery} ${where}`);
            res.send(r);
        } else {
            res.send('Please provide a table in query');
        }
    }
}


const structureQuery = `
SELECT
    tc.table_schema, 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
`