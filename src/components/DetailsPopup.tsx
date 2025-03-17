import { Badge } from "flowbite-react";
import { MdClose } from "react-icons/md";
import { BACKEND_MEDIA_LINK } from "../../utils/ApiKey";

interface PopupProps {
  title: string;
  fields: { label: string; value: string | JSX.Element }[];
  onClose: () => void;
}

const renderBadge = (label: string, value: string | JSX.Element) => {
  if (label === "Featured") {
    return value === "Yes" ? (
      <Badge color="success">Yes</Badge>
    ) : (
      <Badge color="failure">No</Badge>
    );
  }
  if (label === "Status") {
    return value === "Active" ? (
      <Badge color="success">Active</Badge>
    ) : (
      <Badge color="failure">Inactive</Badge>
    );
  }
  if (
    (label === "Subscription Status" || label === "Account Created") &&
    value === "Completed"
  ) {
    return <Badge color="success">Completed</Badge>;
  }
  if (
    (label === "Subscription Status" || label === "Account Created") &&
    value === "Not Completed"
  ) {
    return <Badge color="failure">Not Completed</Badge>;
  }
  if (label === "GST Document Link" && value === "Not Provided") {
    return <Badge color="failure">Not Provided</Badge>;
  } else if (label === "GST Document Link" && value) {
    return (
      <a
        href={`${BACKEND_MEDIA_LINK}${value}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:text-blue-600"
      >
        <button>Open Link</button>
      </a>
    );
  }
  if (label === "Email Verified") {
    return value === "Yes" ? (
      <Badge color="success">Verified</Badge>
    ) : (
      <Badge color="failure">Not Verified</Badge>
    );
  }
  if (label === "Email Verified At") {
    return value === "Not Verified" ? (
      <Badge color="failure">Not Verified</Badge>
    ) : (
      value
    );
  }
  if (label === "Redemption Status" || label === "Redeem Status") {
    return value === "Completed" ? (
      <Badge color="success">Completed</Badge>
    ) : (
      <Badge color="failure">Not Completed</Badge>
    );
  }
  if (label === "Active Subscription") {
    return value === "Yes" ? (
      <Badge color="success">Yes</Badge>
    ) : (
      <Badge color="failure">No</Badge>
    );
  }
  return value !== "null" ? value : "Not provided";
};

const DetailsPopup: React.FC<PopupProps> = ({ title, fields, onClose }) => (
  <section
    onClick={onClose}
    className={`h-[100vh] w-full fixed top-0 left-0 z-50 backdrop-blur-sm bg-black/50 flex justify-center items-center`}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className={`bg-white rounded-md w-[50%] p-6 transition-transform transform scale-in`}
    >
      <div className="flex justify-between w-full items-center mb-5">
        <h3 className="text-2xl font-bold">{title}</h3>
        <button onClick={onClose}>
          <span className="inline-block">
            <MdClose size={20} />
          </span>
        </button>
      </div>
      <div className="overflow-y-auto max-h-[70vh]">
        <table className="w-full text-sm text-left border">
          <tbody>
            {fields.map((field, index) => (
              <tr key={index} className={`border-b`}>
                <td
                  className="font-medium p-3 bg-gray-100 border-r"
                  style={{ width: "35%" }}
                >
                  {field.label}
                </td>
                <td className="p-3 flex items-center" style={{ width: "65%" }}>
                  {renderBadge(field.label, field.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);

export default DetailsPopup;
