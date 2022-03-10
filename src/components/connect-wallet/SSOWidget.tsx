/* eslint-disable jsx-a11y/iframe-has-title */
import { Skeleton } from "antd";
import React, { useContext, useEffect, useRef, useState } from "react";
import "./SSOWidget.scss";
import LocalStorage, { LocalStorageKey } from "services/LocalStorage";
import { AuthContext } from "providers/AuthProvider";

export enum SSOWidgetType {
  inline = "inline",
  onPage = "onPage",
}

type SSOWidgetProps = {
  text: string;
  type: SSOWidgetType;
  style?: object;
  buttonStyle?: object;
  icon?: string;
};

const REACT_APP_SSO_SERVER = "https://staging.sso.orai.io";
const SSOWidget: React.FC<SSOWidgetProps> = React.memo(
  ({
    text = "",
    type = SSOWidgetType.inline,
    style = {},
    buttonStyle = {},
    icon = "https://storage.googleapis.com/orailabelstudio/icon/orai-connect.svg",
  }) => {
    const authCtx = useContext(AuthContext);
    const { dispatch: dispatchAuth } = authCtx;

    const iframeRef = useRef() as any;
    const [iframeLoading, setIframeLoading] = useState(true);

    useEffect(() => {
      const handler = async (event: any) => {
        if (event.origin !== REACT_APP_SSO_SERVER) return;

        const receivedData = event.data;

        if (
          !receivedData ||
          typeof receivedData !== "string" ||
          receivedData === "ready"
        )
          return;

        try {
          const parsedData = JSON.parse(receivedData);

          const token = parsedData?.token;
          if (token) {
            LocalStorage.saveItem(LocalStorageKey.token, token, 86400 * 1000);
            window.location.reload();
          }
        } catch (ex) {
          console.log(ex);
        }
      };
      // Listen to event from sub-window
      const authentication = async () => {
        window.addEventListener("message", handler, false);
        return;
      };

      authentication();
      return () => {
        window.removeEventListener("message", handler);
      };
    }, [dispatchAuth]);

    return (
      <div className="sso_widget">
        <iframe
          onLoad={() => {
            setTimeout(() => {
              setIframeLoading(false);
            }, 1000);
          }}
          ref={iframeRef}
          src={`${REACT_APP_SSO_SERVER}/login/embeded/${type}?serviceURL=${
            window.location.href
          }&text=${encodeURIComponent(text)}&style=${encodeURIComponent(
            JSON.stringify(style)
          )}&buttonStyle=${encodeURIComponent(
            JSON.stringify(buttonStyle)
          )}&iconUrl=${icon}`}
        />
        {iframeLoading && <Skeleton />}
      </div>
    );
  }
);

export default SSOWidget;
