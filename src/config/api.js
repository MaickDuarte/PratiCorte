const API_BASE_URL = "https://praticorte.uc.r.appspot.com"; // ajuste se necessário

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
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erro na requisição");
    }

    return await response.json();
}
