import connectODBC from "../../databases/odbc.js";


const ODBC = await connectODBC();

export async function getMachinesIndex(index, limit) {
    const query = `
        SELECT RESRE.ABDEPT AS "Production Department Code",
        RESRE.ABRESC AS "Resource Code",
        RESRE.ABDES AS "Resource Name",
        RESRE.ABCAPT AS "Resource Capacity",
        RESRE.ABSTIM AS "Starting Time",
        RESRE.ABMACG AS "Machine Group",
        DEPTS.AADNME AS "Department Name",
        MACGRP.ADMDES AS "Machine Group Desc"
        
        FROM RESRE
        LEFT JOIN DEPTS
        ON RESRE.ABDEPT = DEPTS.AADEPT
        LEFT JOIN MACGRP
        ON RESRE.ABMACG = MACGRP.ADMACG
        ORDER BY "Resource Code" ASC
        OFFSET ? ROWS
        FETCH NEXT ? ROWS ONLY
    `;
    return new Promise((resolve, reject) => {
        ODBC.query(query, [index, limit], (error, result) => {
            resolve(result);
        });
    });
}

export async function getMachinesName(name, offset, limit) {
    const query = `
        SELECT RESRE.ABDEPT AS "Production Department Code",
        RESRE.ABRESC AS "Resource Code",
        RESRE.ABDES AS "Resource Name",
        RESRE.ABCAPT AS "Resource Capacity",
        RESRE.ABSTIM AS "Starting Time",
        RESRE.ABMACG AS "Machine Group",
        DEPTS.AADNME AS "Department Name",
        MACGRP.ADMDES AS "Machine Group Desc"
        
        FROM RESRE
        LEFT JOIN DEPTS
        ON RESRE.ABDEPT = DEPTS.AADEPT
        LEFT JOIN MACGRP
        ON RESRE.ABMACG = MACGRP.ADMACG
        WHERE LOWER(RESRE.ABDES) LIKE ? OR LOWER(RESRE.ABRESC) LIKE ? OR LOWER(RESRE.ABDEPT) LIKE ? OR LOWER(MACGRP.ADMDES) LIKE ?
        ORDER BY "Resource Code" ASC
        OFFSET ? ROWS
        FETCH NEXT ? ROWS ONLY
    `;
    const searchName = isNaN(name) ? "%" + name.toLowerCase() + "%" : "%" + name + "%";
    return new Promise((resolve, reject) => {
        ODBC.query(query, [searchName, searchName, searchName, searchName, offset, limit], (error, result) => {
            resolve(result);
        });
    });
}