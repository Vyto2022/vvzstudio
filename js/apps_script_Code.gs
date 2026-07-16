/**
 * VVZ leads collector: Google Sheets + Telegram notify
 *
 * Steps:
 * 1) Create Google Sheet (e.g. "VVZ Leads")
 * 2) Extensions -> Apps Script
 * 3) Paste this code into Code.gs
 * 4) Project Settings -> Script Properties:
 *    SHEET_ID     = <your sheet id>
 *    SHEET_NAME   = Leads (optional, default "Leads")
 *    TG_BOT_TOKEN = <optional>
 *    TG_CHAT_ID   = <optional>
 * 5) Deploy -> New deployment -> Web app:
 *    Execute as: Me
 *    Who has access: Anyone
 * 6) Copy Web app URL and paste it into index.html + index-fr.html (form action="")
 */

function doGet(e) {
  return HtmlService.createHtmlOutput("OK");
}

function doPost(e) {
  try {
    const data = (e && e.parameter) ? e.parameter : {};
    const hp = (data.hp || "").trim(); // honeypot
    if (hp) return htmlRedirect_(data.redirect || defaultRedirect_()); // spam silently

    const props = PropertiesService.getScriptProperties();
    const ssId = props.getProperty("SHEET_ID");
    const sheetName = props.getProperty("SHEET_NAME") || "Leads";
    const tgToken = props.getProperty("TG_BOT_TOKEN");
    const tgChatId = props.getProperty("TG_CHAT_ID");

    if (!ssId) throw new Error("Missing SHEET_ID in Script Properties");

    const ss = SpreadsheetApp.openById(ssId);
    const sh = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);

    // Header (once)
    if (sh.getLastRow() === 0) {
      sh.appendRow(["ts", "lang", "page", "name", "email", "project", "message", "ua"]);
    }

    const row = [
      new Date(),
      data.lang || "",
      data.page || "",
      data.name || "",
      data.email || "",
      data.project || "",
      data.message || "",
      data.ua || ""
    ];
    sh.appendRow(row);

    // Telegram notify (optional)
    if (tgToken && tgChatId) {
      const text =
        "📩 New lead (VVZ)\n" +
        `• Lang: ${data.lang || "-"}\n` +
        `• Page: ${data.page || "-"}\n` +
        `• Name: ${data.name || "-"}\n` +
        `• Email: ${data.email || "-"}\n` +
        `• Project: ${data.project || "-"}\n` +
        `• Message: ${(data.message || "-").slice(0, 1200)}`;

      const url = `https://api.telegram.org/bot${tgToken}/sendMessage`;
      UrlFetchApp.fetch(url, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify({ chat_id: tgChatId, text }),
        muteHttpExceptions: true,
      });
    }

    return htmlRedirect_(data.redirect || defaultRedirect_());
  } catch (err) {
    return HtmlService.createHtmlOutput(
      `<pre style="font:14px/1.5 system-ui;padding:16px;color:#111">Error: ${escapeHtml_(String(err))}</pre>`
    );
  }
}

function defaultRedirect_() {
  return "https://vyto2022.github.io/vvz-site/thanks.html";
}

function htmlRedirect_(url) {
  const safe = escapeHtml_(url);
  return HtmlService.createHtmlOutput(
    `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${safe}">Redirecting...`
  );
}

function escapeHtml_(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}
