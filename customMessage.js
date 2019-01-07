export function handler(event, context, callback) {
  // Identify why was this function invoked
  if (
    event.triggerSource === "CustomMessage_SignUp" ||
    event.triggerSource === "CustomMessage_ResendCode"
  ) {
    // Ensure that your message contains event.request.codeParameter. This is the placeholder for code that will be sent
    const { codeParameter } = event.request;
    const { userName, region } = event;
    const { clientId } = event.callerContext;
    const { email } = event.request.userAttributes;
    const domain = "piecenotes.com";
    const link = `<a href="https://${domain}/confirmUser?client_id=${clientId}&user_name=${userName}&confirmation_code=${codeParameter}>Use this link to verify your account</a>`;
    event.response.emailSubject = "PieceNotes verification link"; // event.request.codeParameter
    event.response.emailMessage = `Thank you for signing up. ${link}`;

    callback(null, event);
  }
}
