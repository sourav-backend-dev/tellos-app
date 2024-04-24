import { useState } from "react";
import {
  Card,
  Heading,
  TextContainer,
  DisplayText,
  TextStyle,
} from "@shopify/polaris";
import { useAppQuery, useToast } from "../hooks";

export function ProductsCard() {
  const [isLoading, setIsLoading] = useState(true);
  const popToast = useToast();
  const {
    data,
    refetch: refetchProductCount,
    isLoading: isLoadingCount,
    isRefetching: isRefetchingCount,
  } = useAppQuery({
    url: "/api/products/count",
    reactQueryOptions: {
      onSuccess: () => {
        setIsLoading(false);
      },
    },
  });

  const handlePopulate = async () => {
    setIsLoading(true);
    // const response = await fetch("/api/products/create");
    // if (response.ok) {
    //   await refetchProductCount();
    //   setToastProps({ content: "5 products created!" });
    // } else {
    //   setIsLoading(false);
    //   setToastProps({
    //     content: "There was an error creating products",
    //     error: true,
    //   });
    // }
    popToast("Populate...");
    await refetchProductCount();
    setIsLoading(false);
  };
  return (
    <Card
      title="Product Counter"
      sectioned
      primaryFooterAction={{
        content: "Populate 5 products",
        onAction: handlePopulate,
        loading: isLoading,
      }}
    >
      <TextContainer spacing="loose">
        <p>
          Sample products are created with a default title and price. You can
          remove them at any time.
        </p>
        <Heading element="h4">
          TOTAL PRODUCTS
          <DisplayText size="medium">
            <TextStyle variation="strong">
              {isLoadingCount ? "-" : data.count}
            </TextStyle>
          </DisplayText>
        </Heading>
      </TextContainer>
    </Card>
  );
}
