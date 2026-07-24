export default function AboutPage() {
  return (
    <div className="app-shell" style={{ maxWidth: 680 }}>
      <div className="top-bar">
        <h1>About Us</h1>
      </div>

      <div className="card" style={{ lineHeight: 1.7 }}>
        <p>
          Manso AI builds AI-powered WhatsApp assistants for small
          businesses in Ghana and beyond. Our platform lets shop owners
          automatically answer customer questions, take orders, and manage
          their business — all through WhatsApp, the app their customers
          already use every day.
        </p>

        <h3 style={{ marginTop: 20 }}>What we do</h3>
        <p>
          Businesses connect their WhatsApp number to our platform. Our AI
          assistant then handles customer conversations — answering product
          questions, taking multi-item orders, collecting delivery addresses,
          and keeping the business owner updated — while giving the owner a
          simple dashboard to manage products, view orders, and track
          customers.
        </p>

        <h3 style={{ marginTop: 20 }}>Contact us</h3>
        <p>
          Email: mahenkora0@gmail.com<br />
          Kumasi, Ghana
        </p>
      </div>
    </div>
  );
}
