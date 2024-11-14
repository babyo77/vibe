import SearchSongPopup from "../SearchSongPopup";
import Userprofile from "../Userprofile";
import Logo from "./Logo";

function Header() {
  return (
    <header className="border max-sm:w-full max-xl:w-11/12 max-lg:w-11/12  max-md:border-none max-md:rounded-none backdrop-blur-lg max-md:w-full w-7/12 p-3 rounded-xl px-5 z-40 border-white/15 flex items-center justify-between ">
      <Logo />

      <SearchSongPopup />
      <Userprofile />
    </header>
  );
}

export default Header;
