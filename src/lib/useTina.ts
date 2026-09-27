import {
  useState,
  useEffect,
  useMemo,
  createContext,
  useContext,
  useSyncExternalStore,
} from "react";
import { hashFromQuery, addMetadata } from "@tinacms/bridge/metadata";
import { QUICK_EDIT_CSS } from "@tinacms/bridge/quick-edit-css";
import { tinaField } from "@tinacms/bridge/tina-field";

export { tinaField };

const emptySubscribe = () => () => {};

export interface TinaHookProps<T> {
  query: string;
  variables?: Record<string, unknown>;
  data: T;
  experimental___selectFormByFormId?: () => string;
}

const TinaAdminOriginContext = createContext<string[] | string | null>(null);

function useTrustedAdminOrigins(): string[] {
  const configured = useContext(TinaAdminOriginContext);
  return useMemo(() => {
    if (configured == null) {
      return typeof window !== "undefined" ? [window.location.origin] : [];
    }
    return Array.isArray(configured) ? [...configured] : [configured];
  }, [configured]);
}

function isFromAdmin(event: MessageEvent, trustedOrigins: string[]): boolean {
  if (typeof window === "undefined") return false;
  if (!trustedOrigins.includes(event.origin)) return false;
  return event.source === window.parent;
}

export function useTina<T extends Record<string, unknown>>(
  props: TinaHookProps<T>
): {
  data: T;
  isClient: boolean;
} {
  const stringifiedQuery = JSON.stringify({
    query: props.query,
    variables: props.variables,
  });

  const id = useMemo(() => hashFromQuery(stringifiedQuery), [stringifiedQuery]);

  const processedData = useMemo(() => {
    if (props.data) {
      const dataCopy = JSON.parse(JSON.stringify(props.data));
      return addMetadata(id, dataCopy, []) as T;
    }
    return props.data;
  }, [props.data, id]);

  const trustedAdminOrigins = useTrustedAdminOrigins();
  const [liveData, setLiveData] = useState<T | null>(null);
  const [quickEditEnabled, setQuickEditEnabled] = useState(false);
  const [isInTinaIframe, setIsInTinaIframe] = useState(false);

  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const data = liveData ?? processedData;

  useEffect(() => {
    if (typeof window !== "undefined" && window.parent) {
      window.parent.postMessage(
        {
          type: "url-changed",
        },
        "*"
      );
    }
  }, [id]);

  useEffect(() => {
    if (quickEditEnabled) {
      const mouseDownHandler = function (e: MouseEvent) {
        const target = e.target as HTMLElement | null;
        if (!target) return;
        const attributeNames = target.getAttributeNames();
        const tinaAttribute = attributeNames.find((name) =>
          name.startsWith("data-tina-field")
        );
        let fieldName: string | null = null;
        if (tinaAttribute) {
          e.preventDefault();
          e.stopPropagation();
          fieldName = target.getAttribute(tinaAttribute);
        } else {
          const ancestor = target.closest(
            "[data-tina-field], [data-tina-field-overlay]"
          );
          if (ancestor) {
            const ancestorAttributes = ancestor.getAttributeNames();
            const ancestorTinaAttr = ancestorAttributes.find((name) =>
              name.startsWith("data-tina-field")
            );
            if (ancestorTinaAttr) {
              e.preventDefault();
              e.stopPropagation();
              fieldName = ancestor.getAttribute(ancestorTinaAttr);
            }
          }
        }
        if (fieldName && isInTinaIframe && typeof window !== "undefined") {
          window.parent.postMessage(
            { type: "field:selected", fieldName },
            window.location.origin
          );
        }
      };

      const style = document.createElement("style");
      style.type = "text/css";
      style.textContent = QUICK_EDIT_CSS;
      document.head.appendChild(style);
      document.body.classList.add("__tina-quick-editing-enabled");
      document.addEventListener("click", mouseDownHandler, true);

      return () => {
        document.removeEventListener("click", mouseDownHandler, true);
        document.body.classList.remove("__tina-quick-editing-enabled");
        style.remove();
      };
    }
  }, [quickEditEnabled, isInTinaIframe]);

  useEffect(() => {
    if (
      props?.experimental___selectFormByFormId &&
      typeof window !== "undefined"
    ) {
      window.parent.postMessage(
        {
          type: "user-select-form",
          formId: props.experimental___selectFormByFormId(),
        },
        "*"
      );
    }
  }, [id, props]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const { experimental___selectFormByFormId: _unused, ...rest } = props;
    window.parent.postMessage(
      { type: "open", ...rest, id },
      window.location.origin
    );

    const handleMessage = (event: MessageEvent) => {
      if (!isFromAdmin(event, trustedAdminOrigins)) return;
      if (event.data?.type === "quickEditEnabled") {
        setQuickEditEnabled(event.data.value);
      }
      if (event.data?.id === id && event.data?.type === "updateData") {
        const rawData = event.data.data;
        const newlyProcessedData = addMetadata(
          id,
          JSON.parse(JSON.stringify(rawData)),
          []
        ) as T;
        setLiveData(newlyProcessedData);
        setIsInTinaIframe(true);
        const anyTinaField = document.querySelector("[data-tina-field]");
        if (anyTinaField) {
          window.parent.postMessage(
            { type: "quick-edit", value: true },
            window.location.origin
          );
        } else {
          window.parent.postMessage(
            { type: "quick-edit", value: false },
            window.location.origin
          );
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      window.parent.postMessage({ type: "close", id }, window.location.origin);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, setQuickEditEnabled, trustedAdminOrigins]);

  return { data, isClient };
}

export function useEditState(): { edit: boolean } {
  const [edit, setEdit] = useState(false);
  const trustedAdminOrigins = useTrustedAdminOrigins();

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.parent.postMessage({ type: "isEditMode" }, window.location.origin);
    const handleMessage = (event: MessageEvent) => {
      if (!isFromAdmin(event, trustedAdminOrigins)) return;
      if (event.data?.type === "tina:editMode") {
        setEdit(true);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [trustedAdminOrigins]);

  return { edit };
}
