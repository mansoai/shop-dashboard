export default function PrivacyPage() {
  return (
    <div className="app-shell" style={{ maxWidth: 680 }}>
      <div className="top-bar">
        <h1>Privacy Policy</h1>
      </div>

      <div className="card" style={{ lineHeight: 1.7 }}>
        <p><em>Last updated: [DATE — fill this in]</em></p>

        <p>
          [YOUR COMPANY NAME] ("we", "us", "our") provides an AI-powered WhatsApp
          assistant platform that helps small businesses communicate with their
          customers, manage orders, and answer questions automatically. This
          policy explains what information we collect, how we use it, and your
          rights regarding that information.
        </p>

        <h3 style={{ marginTop: 20 }}>Information we collect</h3>
        <p>
          When a customer messages a business using our platform, we may collect:
          their WhatsApp phone number, their WhatsApp display name, the content of
          messages exchanged with the business, order details (items, quantities,
          delivery address), and payment status (we do not process or store actual
          payment card or mobile money credentials — payment marking is manual and
          informational only).
        </p>
        <p>
          When a business owner signs up to use our dashboard, we collect their
          shop name, WhatsApp number, email address, and login credentials.
        </p>

        <h3 style={{ marginTop: 20 }}>How we use this information</h3>
        <p>
          We use this information to operate the WhatsApp assistant (answering
          questions, processing orders, sending order/payment status updates),
          to allow business owners to manage their shop through our dashboard,
          and to improve our service. We do not sell customer or business data
          to third parties.
        </p>

        <h3 style={{ marginTop: 20 }}>Third-party services</h3>
        <p>
          We use WhatsApp Business Platform (operated by Meta) to send and
          receive messages, Google's Gemini and DeepSeek AI models to generate
          responses, and Supabase to securely store data. Each of these
          providers has its own privacy practices governing data they process
          on our behalf.
        </p>

        <h3 style={{ marginTop: 20 }}>Data retention</h3>
        <p>
          We retain message and order history for as long as a business's
          account is active, so they can view their order and customer history.
          Businesses can request deletion of their data by contacting us using
          the details below.
        </p>

        <h3 style={{ marginTop: 20 }}>Your rights</h3>
        <p>
          You may request access to, correction of, or deletion of your
          personal information by contacting us at the email below.
        </p>

        <h3 style={{ marginTop: 20 }}>Contact us</h3>
        <p>
          [YOUR COMPANY NAME]<br />
          Email: [YOUR CONTACT EMAIL]<br />
          [YOUR BUSINESS ADDRESS, if applicable]
        </p>
      </div>
    </div>
  );
}
