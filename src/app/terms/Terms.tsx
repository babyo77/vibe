"use client";
import HomeFooter from "@/components/common/HomeFooter";
import { motion } from "framer-motion";
function Terms() {
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
      <div className="w-8/12 max-md:w-full max-md:px-5 mx-auto py-8 px-4">
        <article className="space-y-8">
          <header className=" mb-5">
            <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
            <p className="text-sm text-gray-100">Last Updated: 2024/01/11</p>
          </header>

          <section>
            <h2 className="text-xl font-semibold mb-4">Welcome to Vibe</h2>
            <p className="text-gray-100">
              Vibe is a collaborative music experience app created for
              educational purposes. Please read these Terms of Service carefully
              before using Vibe. By accessing or using the Vibe app, you agree
              to be bound by these terms. If you disagree with any part of these
              terms, please do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">
              1. Purpose of Service
            </h2>
            <p className="text-gray-100">
              Vibe is an experimental, non-commercial music streaming
              application created for educational purposes only. The app allows
              users to vote on songs in a shared queue and engage in a chat room
              with other users. Vibe is not intended for commercial use, and all
              content and features are strictly for learning and educational
              exploration.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. User Eligibility</h2>
            <p className="text-gray-100">
              By using Vibe, you represent that you are at least 18 years of age
              or have the consent of a parent or guardian, and you agree to
              comply with these terms. Users under the age of 18 should use this
              app with parental supervision.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">
              3. User-Generated Content
            </h2>
            <p className="text-gray-100">
              Vibe includes features that allow users to chat and vote on songs.
              By participating in chat and voting:
            </p>
            <ul className="list-disc pl-4 text-gray-100 space-y-2">
              <li>
                You agree to keep interactions respectful and refrain from using
                offensive or inappropriate language.
              </li>
              <li>
                You agree not to post or share any offensive, copyrighted, or
                inappropriate content in chat.
              </li>
              <li>
                Vibe reserves the right to remove or restrict access to content
                that violates these terms.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">
              4. Voting and Queue Management
            </h2>
            <p className="text-gray-100">
              The core feature of Vibe is allowing users to vote on songs they
              want to hear next. The song with the highest number of votes will
              be played next in the queue.
            </p>
            <ul className="list-disc pl-4 mt-2 text-gray-100 space-y-1.5">
              <li>
                Voting is limited to the songs available in the queue, and users
                may vote only on one song at a time.
              </li>
              <li>
                Vibe reserves the right to remove or change the queue, or
                restrict voting capabilities in cases of misuse.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">
              5. Limitations of Service
            </h2>
            <ul className="list-disc pl-4 space-y-2">
              <li className="text-pink-400 ">
                Non-Commercial Use: Vibe is solely for educational use and not
                for any form of monetization or commercial activity.
              </li>
              <li>
                Content Access: Audio content provided is strictly for
                educational purposes. Users are not permitted to download or
                share content outside the app.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">
              6. Privacy and Data Collection
            </h2>
            <p className="text-gray-100">
              Vibe respects user privacy and is designed to collect minimal data
              necessary for its functionality.
            </p>
            <ul className="list-disc pl-4 text-gray-100 space-y-2">
              <li>
                User information such as usernames and votes may be stored for
                the app’s operational purposes.
              </li>
              <li>
                No personal or sensitive information is collected or shared with
                third parties.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">
              7. Limitations of Liability
            </h2>
            <p className="text-gray-100">
              Vibe is provided “as is” without warranties of any kind, express
              or implied. Vibe, its developers, and contributors shall not be
              held liable for any damages resulting from the use of or inability
              to use the app.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. Amendments</h2>
            <p className="text-gray-100">
              Vibe may update these Terms of Service from time to time. Users
              will be notified of any changes through an in-app notification or
              a message.
            </p>
          </section>

          {/* <section>
                  <h2 className="text-xl font-semibold mb-4">9. Contact</h2>
                  <p className="text-gray-100">
                    For questions or concerns about these Terms of Service, please
                    contact us at .
                  </p>
                </section> */}
        </article>
      </div>
      <HomeFooter className=" mt-2.5 relative bottom-5 w-[97%]" />
    </motion.div>
  );
}

export default Terms;
