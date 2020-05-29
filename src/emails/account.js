const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const sendWelcomeEmail = (email, name) => {
  let welcomeEmail = {
    to: email,
    from: `adebisiayomide69@gmail.com`,
    subject: `Welcome to my task manager App `,
    text: `Welcome to the app ${name} , let us know how you get along  .. have fun`,
  };

  sgMail.send(welcomeEmail);
};

const sendCancellationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: `adebisiayomide69@gmail.com`,
    subject: `Goodbye from my task manager App `,
    text: `We feel sad  to see you go ${name} ,What could we have done to keep you `,
  });
};

module.exports = {
  sendWelcomeEmail: sendWelcomeEmail,
  sendCancellationEmail: sendCancellationEmail,
};
