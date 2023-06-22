import { Mail, Test, Workflow, Workflows } from "../types";
import { getAttachments } from "./file";
import { removeHTML, today } from "./utils";

const url = "http://example.com/";

export const isRunning = (status: Test["status"]) => {
  switch (status) {
    case "Running":
    case "Pending":
      return true;
    default:
      return false;
  }
};

export const workflowsHaveContent = (workflows: Workflows) => {
  if (!workflows) return false;
  return workflows.some((workflow: Workflow) => {
    return removeHTML(workflow?.content?.trim()) || workflow?.status?.includes(["Fail", "HW Error", "Warning"] as any);
  });
};

export const workflowsExecuted = (workflows: Workflows) => {
  if (!workflows) return false;

  const executed = ["Success", "Fail", "HW Error", "Warning"];
  const executedWorkflows = workflows.filter((workflow: Workflow) => {
    return executed.includes(workflow?.status as any);
  });

  if (!executedWorkflows.length) {
    return `<p class="tab">No workflows executed</p>`;
  }

  const workflowList = executedWorkflows
    .map((workflow: Workflow) => {
      return `<li><span>${workflow.workflowName}</span></li>`;
    })
    .join("");

  return `<span class="tab">Workflows executed:</span><ul>${workflowList}</ul>`;
};

export const variableIsValid = (value: any) => {
  return !!value;
};

export const format = (html: string) => {
  if (!html) return html;
  html = html
    .replace(/\r?\n|\r/g, "\n")
    .replace(/^[ \t]*[\n\r]+|[ \t]*[\n\r]+$|[ \t]*[\n\r]+[ \t]*[\n\r]+/gm, "\n")
    .replace(/^[ \t]*[\n\r]+/gm, "")
    .split("\n")
    .join("<br>");

  return html;
};

export const getRecipientsByType = (mailList: Mail[], type: string): string[] => {
  return mailList.filter((item) => item.recipientType === type).map((item) => item.name) || [];
};

export const getUniqueReleases = (selectedItems: Test[]): string[] => {
  const uniqueSet = new Set(selectedItems?.map((element) => element.release)) || [];
  return [...uniqueSet];
};

export const getSubject = (selectedItems: Test[]): string => {
  const releases = getUniqueReleases(selectedItems);
  const subject = `Smoke test ${releases.join(", ")}`;
  return subject;
};

export const getStyles = (): string => {
  return `
    body { font-family: 'Calibri', sans-serif; font-size: 11pt; }
    table { table-layout: auto; text-align: left; }
    table, th, td { padding: 7px; border-collapse: collapse; border-spacing: 0; border: 1px solid #334155; }
    table tr th { background-color: #1e90ff; color: #ffffff; text-align: center; }
    td { background-color: inherit; }
    .Success { background-color: rgb(164, 198, 57); }
    .Warning { background-color: orange; }
    .Fail { background-color: red; }
    .HW { background-color: red; }
    .Skipped { background-color: #add8e6; }
    .Running { background-color: rgb(211,211,211); }
    ul, li { list-style-type: disc; font-size: 14px; }
    .error { text-align: left; word-break: break-word; margin: auto; }
    .tab { margin-left: 20px; line-height: 1.5; }
  `;
};

export const getBody = (selectedItems: Test[]): string => {
  let body = `<!DOCTYPE html><html lang='en'><head>
    <title>Smoke Test Report</title>
    <style type='text/css' style='display:none;'>${getStyles()}</style>
    </head><body>`;
  body += `<p>Hi everyone,<br><br> Summary Update from ${today()} Smoke Test: </p><br><table>`;
  body += `<tr><th>Product</th><th>Machine</th><th>Release</th><th>Branch</th><th>Test Name</th><th>Status</th></tr>`;

  const link = (id: string) => {
    return url + "tests/" + id;
  };

  selectedItems.forEach((testItem) => {
    body += `<tr><td>${testItem.product}</td>`;
    body += `<td>${testItem.machine}</td>`;
    body += `<td>${testItem.release}</td>`;
    body += `<td>${testItem.branch}</td>`;
    body += `<td><a href="${link(testItem.testId)}">${testItem.name}</a></td>`;
    body += `<td class="${testItem.status}">${testItem.status}</td></tr>`;
  });
  body += "</table><br>";
  body +=
    "To see more details, please refer to the website <a href=`" +
    url +
    "/tests/completed`>" +
    url +
    "/tests/completed</a><br><br><br>";
  selectedItems?.forEach((testItem) => {
    const uniqueMachine = new Set(testItem?.workflows?.map((element) => element.machine));
    const uniqueIpAddress = new Set(testItem?.workflows?.map((element) => element.ipAddress));
    const uniqueTrolley = new Set(testItem?.workflows?.map((element) => element.trolley));
    const machine = [...uniqueMachine].toString().replace(/,/g, ", ");
    const ipAddress = [...uniqueIpAddress].toString().replace(/,/g, ", ");
    const trolley = [...uniqueTrolley].toString().replace(/,/g, ", ");

    if (!isRunning(testItem.status)) {
      body += `<h3>Test: ${testItem.name} - ${testItem.release} - ${testItem.branch}</h3>`;
      if (testItem.notes) {
        body += `<p><b>Notes:</b> ${testItem.notes}</p>`;
      }

      body += "<ul>";
      body += "<li><strong>IP Address:</strong> " + ipAddress + "</li>";
      body += "<li><strong>Machine used:</strong> " + machine + "</li>";
      body += "<li><strong>Trolley:</strong> " + trolley + "</li>";
      body += `<li>Test reported by ${testItem?.assignedTo || "NA"}</li>`;
      body += "</ul>";

      body += workflowsExecuted(testItem?.workflows);

      if (workflowsHaveContent(testItem?.workflows)) {
        const workflows = testItem?.workflows;
        if (!workflows) return;
        let isHeaderCreated = false;
        workflows.forEach((workflow, index) => {
          if (!isHeaderCreated) {
            body += "<table>";
            body += "<tr><th>Workflow</th><th>Session</th><th>Status</th><th>Error description</th></tr>";
            isHeaderCreated = true;
          }
          if (variableIsValid(removeHTML(workflow?.content))) {
            body += "<tr><td>" + (workflow.workflowName || null) + "</td>";
            body += "<td>" + (workflow.session || null) + "</td>";
            body += `<td class="${workflow.status}"> ${workflow.status || null}</td>`;
            body += "<td class='error'>" + format(workflow?.content || "") + "</td></tr>";
          }
          if (!testItem?.workflows?.length) return;
          if (index === testItem?.workflows?.length - 1) {
            body += "</table>";
          }
        });
      }
    }
  });

  body += `<p>Regards,</p>`;
  body += "</body></html>";
  return body;
};

var MAX_EML_SIZE = 1024 * 1024 * 25; // 25MB

export const createEmail = async (selectedItems: Test[], mailList: Mail[]): Promise<{ message: string }> => {
  try {
    const toRecipients = getRecipientsByType(mailList, "to").join(", ");
    const ccRecipients = getRecipientsByType(mailList, "cc").join(", ");
    const bccRecipients = getRecipientsByType(mailList, "bcc").join(", ");
    const subject = getSubject(selectedItems);
    const body = getBody(selectedItems);

    const warnings = [];
    const haveAttachments = selectedItems.some((item) => item?.files?.length || false);

    let emailContent =
      `To: ${toRecipients}\r\nCc: ${ccRecipients}\r\nBcc: ${bccRecipients}\r\nSubject: ${subject}\r\n` +
      `X-Unsent: 1\r\n`;

    if (haveAttachments) {
      const attachments = [];

      for (const item of selectedItems) {
        if (item?.files?.length) {
          const files = await getAttachments(item._id);
          attachments.push(...files);
        }
      }

      const totalAttachmentsSize = attachments.reduce((acc, attachment) => acc + attachment.size, 0);
      if (totalAttachmentsSize > MAX_EML_SIZE) {
        // Total attachments size exceeds 25MB, remove attachments
        emailContent += `Content-Type: text/html; charset="UTF-8"\r\n\r\n${body}\r\n`;
        warnings.push("Total attachments size exceeds 25MB, attachments removed");
      } else {
        const boundary = "boundary_" + Math.random().toString(16).substr(2);
        emailContent += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;

        // Add the HTML body part
        emailContent += `--${boundary}\r\n` + `Content-Type: text/html; charset="UTF-8"\r\n\r\n${body}\r\n`;

        // Add the attachments
        for (const attachment of attachments) {
          if (attachment) {
            // Encode the file data in base64
            const fileData = new Uint8Array(attachment.file.data);
            // Split the file data into chunks of 65535 bytes
            const chunkSize = 65535;

            let encodedFileData = "";

            for (let i = 0; i < fileData.length; i += chunkSize) {
              // Convert the chunk to a base64 string
              const chunk = fileData.slice(i, i + chunkSize);
              const encodedChunk = btoa(String.fromCharCode.apply(null, Array.from(chunk)));
              // Append the chunk to the encoded file data
              encodedFileData += encodedChunk;
            }

            emailContent +=
              `--${boundary}\r\n` +
              `Content-Type: ${attachment?.contentType || "application/octet-stream"}\r\n` +
              `Content-Disposition: attachment; filename="${attachment.name || "attachment"}"\r\n` +
              `Content-Transfer-Encoding: base64\r\n\r\n` +
              `${encodedFileData}\r\n`;
          }
        }

        emailContent += `--${boundary}--\r\n`;
      }
    } else {
      emailContent += `Content-Type: text/html; charset="UTF-8"\r\n\r\n${body}\r\n`;
    }

    const emlContent = `data:message/rfc822 eml;charset=utf-8,${encodeURIComponent(emailContent)}`;

    const downloadLink = document.createElement("a");
    downloadLink.href = emlContent;
    downloadLink.setAttribute("download", "report.eml");
    downloadLink.click();

    return {
      message: warnings.length
        ? `Email created with warnings:
        ${warnings.map((warning) => `- ${warning}`).join("\n")}`
        : "Email created successfully",
    };
  } catch (error) {
    console.log(error);
    return {
      message: "Error creating email" + error,
    };
  }
};
