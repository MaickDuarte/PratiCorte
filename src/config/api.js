import { getUsuario, getEstabelecimento } from '../config/auth';

const API_BASE_URL = "https://praticorte.uc.r.appspot.com"; // ajuste se necessário
//const API_BASE_URL = "http://localhost:8080"; // ajuste se necessário
export async function apiRequest({ method = "GET", route, params, body }) {
    let url = `${API_BASE_URL}/${route}`;

    // Query params (GET)
    if (params && method.toUpperCase() === "GET") {
        const qs = new URLSearchParams(params).toString();
        url += `?${qs}`;
    }

    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
        },
    };

    // Body (POST/PUT/PATCH/DELETE)
    if (body) {
        const establishment = getEstabelecimento() ?? body?.establishmentId
        body.estabelecimentoId = establishment.id ?? body?.establishmentId
        body.updatedBy = getUsuario() ?? ""
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erro na requisição");
    }

    return await response.json();
}
