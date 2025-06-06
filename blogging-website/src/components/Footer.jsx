import { Footer, FooterLink, FooterLinkGroup } from "flowbite-react";
import { Link } from "react-router-dom";
import { BsFacebook, BsInstagram, BsGithub, BsLinkedin } from "react-icons/bs";

export default function FooterCom() {
  return (
    <Footer container className="border border-t-8 border-teal-500">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid w-full justify-between sm:flex md:grid-cols-1">
          <div className="mt-5">
            <Link
              to="/"
              className="self-center whitespace-nowrap text-lg sm:text-xl font-semibold dark:text-white"
            >
              <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">
                Vistoraa's
              </span>
              Blog
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-8 mt-4 sm:grid-cols-3 sm:gap-6">
            <div>
              <Footer.Title title="About" />
              <FooterLinkGroup col>
                <FooterLink
                  href="https://babardev.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Portfolio
                </FooterLink>
                <FooterLink
                  href="/about"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Vistoraa's Blog
                </FooterLink>
              </FooterLinkGroup>
            </div>
            <div>
              <Footer.Title title="Follow Us" />
              <FooterLinkGroup col>
                <FooterLink
                  href="https://github.com/BabarDeveloper"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Github
                </FooterLink>
                <FooterLink href="#">Discord</FooterLink>
              </FooterLinkGroup>
            </div>
            <div>
              <Footer.Title title="Legal" />
              <FooterLinkGroup col>
                <FooterLink href="#">Privacy Policy</FooterLink>
                <FooterLink href="#">Terms &amp; Conditions</FooterLink>
              </FooterLinkGroup>
            </div>
          </div>
        </div>
        <Footer.Divider />
        <div className="w-full sm:flex sm:items-center sm:justify-between">
          <Footer.Copyright
            href="#"
            by="Vistoraa's blog"
            year={new Date().getFullYear()}
          />
          <div className="flex gap-6 sm:mt-0 mt-4 sm:justify-center">
            <Footer.Icon
              href="https://www.facebook.com/profile.php?id=100067692525452"
              icon={BsFacebook}
              target="_blank"
              rel="noopener noreferrer"
            />
            <Footer.Icon
              href="https://www.instagram.com/babar_4li/"
              icon={BsInstagram}
              target="_blank"
              rel="noopener noreferrer"
            />
            <Footer.Icon
              href="https://www.linkedin.com/in/babar-ali2/"
              icon={BsLinkedin}
              target="_blank"
              rel="noopener noreferrer"
            />
            <Footer.Icon
              href="https://github.com/BabarDeveloper"
              icon={BsGithub}
              target="_blank"
              rel="noopener noreferrer"
            />
          </div>
        </div>
      </div>
    </Footer>
  );
}
