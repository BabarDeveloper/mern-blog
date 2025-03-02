import { Alert, Button } from "flowbite-react";
import { HiEye, HiInformationCircle } from "react-icons/hi";
import Projects from "./Projects";

export default function Error() {
  return (
    <Alert
      additionalContent={<Projects />}
      color="success"
      icon={HiInformationCircle}
      onDismiss={() => alert("Alert dismissed!")}
      rounded
    >
      <span className="font-medium">Info alert!</span> Change a few things up
      and try submitting again.
    </Alert>
  );
}
