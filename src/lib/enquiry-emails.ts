import { enquiryTypeDetails, escapeHtml, type Enquiry } from "./enquiry";

function enquirySummary(enquiry: Enquiry) {
  return [
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    `Phone: ${enquiry.phone ?? "Not provided"}`,
    `Country/location: ${enquiry.countryLocation}`,
    `Enquiry type: ${enquiryTypeDetails[enquiry.enquiryType].label}`,
    `Subject: ${enquiry.subject}`,
    "",
    enquiry.message,
  ].join("\n");
}

export function buildConsulateEmail(enquiry: Enquiry) {
  const details = enquiryTypeDetails[enquiry.enquiryType];
  const phone = enquiry.phone
    ? `<p><strong>Phone:</strong> ${escapeHtml(enquiry.phone)}</p>`
    : "";

  return {
    subject: `${details.prefix} ${enquiry.subject}`,
    text: enquirySummary(enquiry),
    html: `
      <h1>New website enquiry</h1>
      <p><strong>Enquiry type:</strong> ${escapeHtml(details.label)}</p>
      <p><strong>Name:</strong> ${escapeHtml(enquiry.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(enquiry.email)}</p>
      ${phone}
      <p><strong>Country/location:</strong> ${escapeHtml(enquiry.countryLocation)}</p>
      <p><strong>Subject:</strong> ${escapeHtml(enquiry.subject)}</p>
      <hr />
      <p>${escapeHtml(enquiry.message).replaceAll("\n", "<br />")}</p>
    `,
  };
}

export function buildAcknowledgementEmail(
  enquiry: Enquiry,
  responseWindow: string,
) {
  const firstName = enquiry.name.split(/\s+/)[0] || enquiry.name;

  const text = [
    `Kia ora ${firstName},`,
    "",
    "Obrigadu barak — your message has been received.",
    `The Honorary Consulate aims to respond within ${responseWindow}.`,
    "",
    "Visa applications, passports and official consular documents are handled by the Embassy of Timor-Leste in Wellington:",
    "Phone: (04) 471 1971",
    "Email: embassy.timorleste.nz@gmail.com",
    "",
    "Honorary Consulate of Timor-Leste",
    "Auckland & North Island, New Zealand",
  ].join("\n");

  return {
    subject: "Your enquiry has been received",
    text,
    html: `
      <p>Kia ora ${escapeHtml(firstName)},</p>
      <p><strong>Obrigadu barak — your message has been received.</strong></p>
      <p>The Honorary Consulate aims to respond within ${escapeHtml(responseWindow)}.</p>
      <hr />
      <h2>Visa, passport or official document enquiry?</h2>
      <p>These services are handled by the Embassy of Timor-Leste in Wellington:</p>
      <p>
        Phone: <a href="tel:+6444711971">(04) 471 1971</a><br />
        Email: <a href="mailto:embassy.timorleste.nz@gmail.com">embassy.timorleste.nz@gmail.com</a>
      </p>
      <p>Honorary Consulate of Timor-Leste<br />Auckland &amp; North Island, New Zealand</p>
    `,
  };
}
