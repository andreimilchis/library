import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { cui } = await request.json();

    if (!cui) {
      return NextResponse.json({ error: "CUI is required" }, { status: 400 });
    }

    const cleanCui = cui.replace(/\D/g, "");
    const today = new Date().toISOString().split("T")[0];

    const response = await fetch(
      "https://webservicesp.anaf.ro/PlatitorTvaRest/api/v8/ws/tva",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([
          { cui: parseInt(cleanCui), data: today },
        ]),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from ANAF" },
        { status: 502 }
      );
    }

    const data = await response.json();

    if (data.found && data.found.length > 0) {
      const company = data.found[0];
      return NextResponse.json({
        name: company.date_generale?.denumire || "",
        address: company.date_generale?.adresa || "",
        cui: cleanCui,
        jNumber: company.date_generale?.nrRegCom || "",
        tvaRegistered: company.inregistrare_scop_Tva?.scpTVA || false,
        phone: company.date_generale?.telefon || "",
        city: "",
        county: "",
      });
    }

    return NextResponse.json({ error: "CUI not found" }, { status: 404 });
  } catch (error) {
    console.error("ANAF API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
