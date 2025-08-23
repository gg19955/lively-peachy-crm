import TopAppBar from "@/components/TopAppBar";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopAppBar />
      <main className="p-6">
        <div className="prose dark:prose-invert max-w-4xl mx-auto prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary-foreground prose-blockquote:text-muted-foreground">
          <h1>Terms of Service</h1>
          <p>
            <strong>Effective Date:</strong> August 23 2025
          </p>
          <p>
            <strong>Last Updated:</strong> August 23 2025
          </p>
          <p>
            Welcome to Lively Properties & Peachy Properties (“we,” “our,” or
            “us”). These Terms of Service (“Terms”) govern your access to and
            use of our property management application (the “App”).
          </p>
          <p>
            By using the App, you agree to these Terms. If you do not agree, you
            must not use the App.
          </p>

          <h2>1. Eligibility</h2>
          <p>You must be at least 18 years old to use the App.</p>
          <p>
            By using the App, you represent that you have the authority to enter
            into these Terms, whether on your own behalf or on behalf of a
            business.
          </p>

          <h2>2. Accounts</h2>
          <p>
            To use certain features, you must create an account and provide
            accurate, complete information.
          </p>
          <p>
            You are responsible for maintaining the confidentiality of your
            login details and all activities under your account.
          </p>
          <p>
            We reserve the right to suspend or terminate accounts that provide
            false information or violate these Terms.
          </p>

          <h2>3. Use of the App</h2>
          <p>
            You agree to use the App only for lawful purposes and in accordance
            with these Terms. You must not:
          </p>
          <ul>
            <li>
              Use the App in a way that infringes on others’ rights, privacy, or
              security.
            </li>
            <li>Upload, share, or transmit harmful or fraudulent content.</li>
            <li>
              Attempt to interfere with or disrupt the App, its servers, or
              networks.
            </li>
            <li>Use the App to manage properties without proper authority.</li>
          </ul>

          <h2>4. Services Provided</h2>
          <p>
            The App allows property owners, managers, and tenants/guests to:
          </p>
          <ul>
            <li>Manage property listings, bookings, and communications.</li>
            <li>Store and share property-related information.</li>
            <li>Process payments securely through third-party providers.</li>
          </ul>
          <p>
            We provide the App “as is” and make no guarantees that it will be
            error-free, uninterrupted, or fit for a particular purpose.
          </p>

          <h2>5. Payments and Fees</h2>
          <p>
            Some features may require payment of fees. All fees are stated
            before purchase.
          </p>
          <p>
            Payments are processed by third-party providers. We are not
            responsible for errors, delays, or security issues arising from
            these providers.
          </p>
          <p>
            You are responsible for any taxes applicable to your use of the App.
          </p>

          <h2>6. Property and Guest Information</h2>
          <p>
            You are responsible for the accuracy of all property, guest, and
            booking information entered into the App.
          </p>
          <p>
            We are not liable for disputes between property owners, managers,
            tenants, or guests.
          </p>
          <p>
            You must comply with all local laws and regulations relating to
            property rentals, privacy, and safety.
          </p>

          <h2>7. Intellectual Property</h2>
          <p>
            All intellectual property rights in the App (including software,
            branding, logos, and content) remain our property or that of our
            licensors.
          </p>
          <p>
            You may not copy, modify, distribute, or create derivative works of
            the App without prior written permission.
          </p>

          <h2>8. Data Protection</h2>
          <p>
            Your use of the App is also governed by our{" "}
            <a href="[Insert Link]">Privacy Policy</a>. By using the App, you
            consent to the collection and use of your information as outlined in
            the Privacy Policy.
          </p>

          <h2>9. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law:</p>
          <ul>
            <li>
              We are not liable for indirect, incidental, special, or
              consequential damages arising out of your use of the App.
            </li>
            <li>
              Our total liability for any claim related to the App will not
              exceed the fees you paid to us in the 12 months prior to the
              claim.
            </li>
          </ul>

          <h2>10. Indemnification</h2>
          <p>
            You agree to indemnify and hold us harmless from any claims,
            damages, losses, or expenses (including legal fees) arising from
            your use of the App, your content, or your violation of these Terms.
          </p>

          <h2>11. Termination</h2>
          <p>
            We may suspend or terminate your account and access to the App if
            you:
          </p>
          <ul>
            <li>Breach these Terms.</li>
            <li>Misuse the App or cause harm to others.</li>
            <li>Fail to pay applicable fees.</li>
          </ul>
          <p>
            Upon termination, your right to use the App ceases immediately.
            Certain provisions (including Limitation of Liability,
            Indemnification, and Governing Law) will survive termination.
          </p>

          <h2>12. Changes to the Terms</h2>
          <p>
            We may update these Terms from time to time. If we make significant
            changes, we will notify you by posting an update in the App.
            Continued use of the App after changes take effect means you accept
            the updated Terms.
          </p>

          <h2>13. Governing Law</h2>
          <p>
            These Terms are governed by the laws of [Insert Jurisdiction, e.g.,
            State of Victoria, Australia]. Any disputes will be subject to the
            exclusive jurisdiction of the courts in that jurisdiction.
          </p>

          <h2>14. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us:</p>
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

export default TermsOfService;
