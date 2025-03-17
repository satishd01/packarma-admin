import { useState } from "react";
import MetaSettings from "./MetaSettings";
import {
  AiOutlineInfoCircle,
  AiOutlineFileText,
  AiOutlineLink,
  AiOutlineAppstore,
  AiOutlineFileDone,
} from "react-icons/ai";
import PrivacyPolicy from "./PrivacyPolicy";
import TermsAndConditions from "./TermsAndConditions";
import AboutUs from "./AboutUs";
import AppDetails from "./AppDetails";
import SocialLinks from "./SocialLinks";
import InvoiceDetails from "./InvoiceDetails";
import ReferEarnTAC from "./ReferEarnTAC";
import ReferEarnBenefits from "./ReferEarnBenefits";

const settings = () => {
  const [selectedSetting, setSelectedSetting] =
    useState<string>("Meta Details");

  const settingsList = [
    { name: "Meta Details", icon: <AiOutlineInfoCircle /> },
    { name: "About Us", icon: <AiOutlineFileText /> },
    { name: "Terms and Conditions", icon: <AiOutlineFileText /> },
    { name: "Privacy Policy", icon: <AiOutlineFileText /> },
    { name: "Social Links", icon: <AiOutlineLink /> },
    { name: "App Details", icon: <AiOutlineAppstore /> },
    { name: "Invoice Detail", icon: <AiOutlineFileDone /> },
    { name: "Refer and Earn Benefits", icon: <AiOutlineFileDone /> },
    { name: "Refer and Earn T&C", icon: <AiOutlineFileDone /> },
  ];

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-4 border-l-8 text-black border-lime-500 pl-2">
        General Settings
      </h1>
      <section className="flex justify-center items-start ml-2 mt-6">
        <div className="w-[20%] bg-gray-50">
          <ul className="list-none p-0">
            {settingsList.map((setting, index) => (
              <li
                key={index}
                className={`p-2 flex items-center ${
                  index !== settingsList.length - 1 ? "border-b" : ""
                } text-sm cursor-pointer rounded-md mb-1 ${
                  selectedSetting === setting.name
                    ? "bg-lime-500 text-black"
                    : ""
                }`}
                onClick={() => setSelectedSetting(setting.name)}
              >
                {setting.icon}
                <span className="ml-2">{setting.name}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className=" px-10 w-[80%]">
          {selectedSetting === "Meta Details" && <MetaSettings />}
          {selectedSetting === "Privacy Policy" && <PrivacyPolicy />}
          {selectedSetting === "Terms and Conditions" && <TermsAndConditions />}
          {selectedSetting === "About Us" && <AboutUs />}
          {selectedSetting === "App Details" && <AppDetails />}
          {selectedSetting === "Social Links" && <SocialLinks />}
          {selectedSetting === "Invoice Detail" && <InvoiceDetails />}
          {selectedSetting === "Refer and Earn Benefits" && (
            <ReferEarnBenefits />
          )}
          {selectedSetting === "Refer and Earn T&C" && <ReferEarnTAC />}
        </div>
      </section>
    </div>
  );
};

export default settings;
