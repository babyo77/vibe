"use client";
import HomeFooter from "@/components/common/HomeFooter";
import { motion } from "framer-motion";
function Privacy() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        filter: "blur(10px)",
      }}
      animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
      transition={{
        duration: 0.75,
      }}
      exit={{ opacity: 0 }}
      className=" flex items-center font-medium flex-col  w-full justify-center bg-[url('/mask.svg')] bg-cover"
    >
      <div className="w-8/12 max-md:w-full max-md:px-5 py-8 px-4">
        <article className="space-y-8">
          <header className=" mb-5">
            <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-sm text-gray-100">Last Updated: 2024/01/11</p>
          </header>

          <section>
            <h2 className="text-xl font-semibold mb-4">Introduction</h2>
            <p className="text-gray-100">
              Vibe is committed to protecting your privacy. This Privacy Policy
              outlines the types of information we collect, how it’s used, and
              the measures we take to safeguard your data. By using the Vibe
              app, you agree to the data practices outlined in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">
              1. Information We Collect
            </h2>
            <p className="text-gray-100">
              Vibe is designed to collect minimal data for its functionality.
              The information we collect includes:
            </p>
            <ul className="list-disc pl-4 text-gray-100 space-y-2">
              <li>
                Username for identification in chat and voting activities.
              </li>
              <li>
                Voting Activity to manage song queue preferences within the app.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">
              2. How We Use Your Information
            </h2>
            <p className="text-gray-100">
              The information collected by Vibe is used exclusively for app
              functionality. Specifically:
            </p>
            <ul className="list-disc pl-4 text-gray-100 space-y-2">
              <li>To display usernames in chat for user interactions.</li>
              <li>To record voting preferences for queue management.</li>
            </ul>
            <p className="text-pink-400 mt-2">
              We do not sell, trade, or otherwise share your personal
              information with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">
              3. Data Storage and Security
            </h2>
            <p className="text-gray-100">
              Vibe takes reasonable measures to secure your data. Your
              information is stored securely and is accessible only to those
              with authorized access rights. However, no data transmission or
              storage system can be guaranteed to be 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">
              4. Third-Party Services
            </h2>
            <p className="text-gray-100">
              Vibe does not share any personal data with third-party services.
              All processing and storage of information remain within the app’s
              secure environment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. User Rights</h2>
            <p className="text-gray-100">You have the right to:</p>
            <ul className="list-disc pl-4 text-gray-100 space-y-2">
              <li>Request access to your data stored within Vibe.</li>
              <li>
                Request deletion of your data, subject to technical feasibility
                and legal obligations.
              </li>
            </ul>
            {/* <p className="text-gray-100">
              To exercise these rights, please contact us at [Contact Email].
            </p> */}
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">
              6. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-100">
              Vibe may update this Privacy Policy as necessary. Users will be
              notified of significant changes through an in-app notification. We
              encourage you to review this policy periodically.
            </p>
          </section>

          {/* <section>
            <h2 className="text-xl font-semibold mb-4">7. Contact Us</h2>
            <p className="text-gray-100">
              For questions or concerns about this Privacy Policy, please
              contact us at [Contact Email].
            </p>
          </section> */}
        </article>
      </div>
      <HomeFooter className=" mt-2.5 relative bottom-5 w-[97%]" />
    </motion.div>
  );
}

export default Privacy;
