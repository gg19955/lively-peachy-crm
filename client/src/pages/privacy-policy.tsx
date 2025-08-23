import TopAppBar from "@/components/TopAppBar";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopAppBar />
      <main className="p-6">
        <div className="prose dark:prose-invert max-w-4xl mx-auto prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary-foreground prose-blockquote:text-muted-foreground">
          <h1>Privacy Policy</h1>
          <p>
            <strong>Effective Date:</strong> August 23 2025
          </p>
          <p>
            <strong>Last Updated:</strong> August 23 2025
          </p>
          <p>
            This Privacy Policy describes how Lively Properties & Peachy
            Properties (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;)
            collects, uses, stores, and protects your personal information when
            you use our property management application (“The App”).
          </p>
          <p>
            By using our App, you agree to the practices described in this
            Privacy Policy.
          </p>

          <h2>1. Information We Collect</h2>
          <p>
            We collect the following types of information to provide and improve
            our services:
          </p>
          <h3>a. Information You Provide</h3>
          <ul>
            <li>
              <strong>Account details:</strong> Name, email address, phone
              number, company name, billing information.
            </li>
            <li>
              <strong>Property details:</strong> Property addresses,
              descriptions, photos, amenities, and pricing.
            </li>
            <li>
              <strong>Tenant and guest information:</strong> Contact details,
              booking history, identification documents (if applicable).
            </li>
            <li>
              <strong>Payment information:</strong> Bank details or payment card
              details (processed securely by third-party providers).
            </li>
          </ul>

          <h3>b. Automatically Collected Information</h3>
          <ul>
            <li>
              <strong>Usage data:</strong> IP address, device information,
              browser type, operating system, and activity within the App.
            </li>
            <li>
              <strong>Cookies and tracking technologies:</strong> Used to
              improve user experience, analytics, and security.
            </li>
          </ul>

          <h3>c. Third-Party Data</h3>
          <p>
            Data we may receive from booking platforms (e.g., Airbnb,
            Booking.com), payment providers, or integrations you authorise.
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>We use collected information for the following purposes:</p>
          <ul>
            <li>
              To provide property management, booking, and communication
              services.
            </li>
            <li>To process payments, invoices, and owner/tenant statements.</li>
            <li>To verify identity and prevent fraud.</li>
            <li>
              To communicate with you regarding bookings, maintenance, or
              account activity.
            </li>
            <li>
              To improve and personalise the App, including analytics and
              troubleshooting.
            </li>
            <li>
              To comply with legal obligations and enforce our terms and
              conditions.
            </li>
          </ul>

          <h2>3. Sharing Your Information</h2>
          <p>
            We do not sell your personal information. We only share it as
            necessary:
          </p>
          <ul>
            <li>
              <strong>With service providers</strong> who help us operate the
              App (IT support, cloud hosting, payment processors).
            </li>
            <li>
              <strong>With property owners or managers</strong> when required to
              manage bookings, maintenance, or communication.
            </li>
            <li>
              <strong>With third-party booking platforms</strong> if you connect
              your listings.
            </li>
            <li>
              <strong>For legal compliance</strong> when required by law, court
              order, or regulatory authority.
            </li>
          </ul>

          <h2>4. Data Security</h2>
          <p>
            We implement appropriate technical and organisational measures to
            protect your data against loss, theft, misuse, unauthorised access,
            or disclosure.
          </p>
          <ul>
            <li>Data is encrypted in transit and at rest.</li>
            <li>Access is restricted to authorised personnel only.</li>
            <li>
              Regular monitoring and audits are carried out to maintain
              security.
            </li>
          </ul>

          <h2>5. Data Retention</h2>
          <p>We retain personal information only as long as necessary:</p>
          <ul>
            <li>For the purpose it was collected.</li>
            <li>To meet legal, accounting, or reporting requirements.</li>
          </ul>
          <p>When no longer needed, data is securely deleted or anonymised.</p>

          <h2>6. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul>
            <li>Access, update, or correct your personal information.</li>
            <li>Request deletion of your information.</li>
            <li>Restrict or object to certain data processing.</li>
            <li>Request a copy of your data in a portable format.</li>
          </ul>
          <p>To exercise these rights, contact us at [Insert Contact Email].</p>

          <h2>7. International Data Transfers</h2>
          <p>
            If you access the App outside of Australia, your data may be
            transferred to and processed in countries where data protection laws
            differ from your own. We ensure appropriate safeguards are in place.
          </p>

          <h2>8. Children’s Privacy</h2>
          <p>
            Our App is not intended for children under 16. We do not knowingly
            collect personal information from children. If we learn we have done
            so, we will delete it promptly.
          </p>

          <h2>9. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be
            posted in the App, and the &quot;Last Updated&quot; date will be
            revised. Continued use of the App after updates constitutes
            acceptance of the revised policy.
          </p>

          <h2>10. Contact Us</h2>
          <p>
            If you have any questions, concerns, or requests regarding this
            Privacy Policy, please contact us at:
          </p>
          <p>Lively Properties & Peachy Properties</p>
          <p>
            <strong>Email:</strong> hello@livelyproperties.com.au
            hello@peachyproperties.com.au
          </p>
          <p>
            <strong>Address:</strong> Level 1, 3/9 Howey St, Mount Martha,
            Victoria, Australia
          </p>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
