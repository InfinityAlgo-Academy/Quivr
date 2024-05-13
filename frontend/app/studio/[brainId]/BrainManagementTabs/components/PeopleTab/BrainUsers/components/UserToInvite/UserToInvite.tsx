import { useEffect, useState } from "react";

import styles from "./UserToInvite.module.scss";

import { SingleSelector } from "../../../../../../../../../lib/components/ui/SingleSelector/SingleSelector";
import { TextInput } from "../../../../../../../../../lib/components/ui/TextInput/TextInput";
import {
  BrainRoleAssignation,
  BrainRoleType,
  userRoleToAssignableRoles,
} from "../../types";

type UserToInviteProps = {
  onChange: (newRole: BrainRoleAssignation) => void;
  removeCurrentInvitation?: () => void;
  roleAssignation: BrainRoleAssignation;
};

export const UserToInvite = ({
  onChange,
  removeCurrentInvitation,
  roleAssignation,
}: UserToInviteProps): JSX.Element => {
  const [selectedRole, setSelectedRole] = useState<BrainRoleType>(
    roleAssignation.role
  );
  const [email, setEmail] = useState(roleAssignation.email);

  useEffect(() => {
    if (
      email !== roleAssignation.email ||
      selectedRole !== roleAssignation.role
    ) {
      onChange({
        ...roleAssignation,
        email,
        role: selectedRole,
      });
    }
  }, [email, onChange, roleAssignation, selectedRole]);

  return (
    <div className={styles.user_to_invite_wrapper}>
      <TextInput
        label="Email"
        inputValue={email}
        setInputValue={setEmail}
        onKeyDown={(event) => {
          console.info(event.key);
          if (
            event.key === "Backspace" &&
            removeCurrentInvitation &&
            !email.length
          ) {
            removeCurrentInvitation();
          }
        }}
      />

      <div className={styles.selector}>
        <SingleSelector
          selectedOption={{ label: selectedRole, value: selectedRole }}
          options={userRoleToAssignableRoles["Owner"]}
          onChange={setSelectedRole}
          placeholder="Role"
          iconName="user"
        />
      </div>
    </div>
  );
};
