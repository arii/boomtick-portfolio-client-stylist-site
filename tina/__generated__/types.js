export function gql(strings, ...args) {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (args[i] || "");
  });
  return str;
}
export const PagePartsFragmentDoc = gql`
    fragment PageParts on Page {
  __typename
  hero {
    __typename
    badge
    headline
    subheading
    availabilityNotice
  }
  services {
    __typename
    sectionTitle
    pricingNote
    servicesList {
      __typename
      name
      price
      duration
      description
      deliverables
      examples {
        __typename
        image
        styleLabel
        alt
      }
      id
      calSlug
    }
  }
  portfolio {
    __typename
    heroImage
    ogImage
    ogImageAlt
    portfolioList {
      __typename
      title
      id
      image
      alt
      tag
      images
    }
  }
  faq {
    __typename
    sectionTitle
    sectionSubtitle
    faqList {
      __typename
      question
      answer
    }
  }
  events {
    __typename
    title
    description
    showForm
    formFields {
      __typename
      ... on PageEventsFormFieldsInputField {
        label
        fieldType
        placeholder
        required
      }
      ... on PageEventsFormFieldsSelectField {
        label
        options
        required
      }
      ... on PageEventsFormFieldsTextareaField {
        label
        placeholder
        required
      }
    }
    formOptions {
      __typename
      submitButtonText
    }
  }
  site {
    __typename
    studioName
    stylistName
    title
    description
    keywords
    email
    phone
    instagramHandle
    locationDisplay
    calUsername
    calDefaultSlug
    address {
      __typename
      locality
      region
      country
    }
    geo {
      __typename
      latitude
      longitude
    }
    areaServed
    openingDays
    openingHours {
      __typename
      opens
      closes
    }
    priceRange
  }
}
    `;
export const PageDocument = gql`
    query page($relativePath: String!) {
  page(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...PageParts
  }
}
    ${PagePartsFragmentDoc}`;
export const PageConnectionDocument = gql`
    query pageConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: PageFilter) {
  pageConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...PageParts
      }
    }
  }
}
    ${PagePartsFragmentDoc}`;
export function getSdk(requester) {
  return {
    page(variables, options) {
      return requester(PageDocument, variables, options);
    },
    pageConnection(variables, options) {
      return requester(PageConnectionDocument, variables, options);
    }
  };
}
import { createClient } from "tinacms/dist/client";
const generateRequester = (client) => {
  const requester = async (doc, vars, options) => {
    let url = client.apiUrl;
    if (options?.branch) {
      const index = client.apiUrl.lastIndexOf("/");
      url = client.apiUrl.substring(0, index + 1) + options.branch;
    }
    const data = await client.request({
      query: doc,
      variables: vars,
      url
    }, options);
    return { data: data?.data, errors: data?.errors, query: doc, variables: vars || {} };
  };
  return requester;
};
export const ExperimentalGetTinaClient = () => getSdk(
  generateRequester(
    createClient({
      url: "https://content.tinajs.io/3.0/content/87e12abe-90fc-43a9-9f88-48270c37724d/github/main",
      queries
    })
  )
);
export const queries = (client) => {
  const requester = generateRequester(client);
  return getSdk(requester);
};
