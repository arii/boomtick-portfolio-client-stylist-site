export function gql(strings, ...args) {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (args[i] || "");
  });
  return str;
}
export const HeroPartsFragmentDoc = gql`
  fragment HeroParts on Hero {
    __typename
    badge
    headline
    subheading
    availabilityNotice
    instagramUrl
  }
`;
export const EventsPartsFragmentDoc = gql`
  fragment EventsParts on Events {
    __typename
    title
    description
  }
`;
export const ServicesPartsFragmentDoc = gql`
  fragment ServicesParts on Services {
    __typename
    servicesList {
      __typename
      id
      name
      price
      duration
      description
      deliverables
      calSlug
    }
  }
`;
export const PortfolioPartsFragmentDoc = gql`
  fragment PortfolioParts on Portfolio {
    __typename
    portfolioList {
      __typename
      id
      image
      alt
      tag
    }
  }
`;
export const SitePartsFragmentDoc = gql`
  fragment SiteParts on Site {
    __typename
    studioName
    stylistName
    title
    description
    email
    phone
    instagram
    locationDisplay
    priceRange
  }
`;
export const HeroDocument = gql`
  query hero($relativePath: String!) {
    hero(relativePath: $relativePath) {
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
      ...HeroParts
    }
  }
  ${HeroPartsFragmentDoc}
`;
export const HeroConnectionDocument = gql`
  query heroConnection(
    $before: String
    $after: String
    $first: Float
    $last: Float
    $sort: String
    $filter: HeroFilter
  ) {
    heroConnection(
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
          ...HeroParts
        }
      }
    }
  }
  ${HeroPartsFragmentDoc}
`;
export const EventsDocument = gql`
  query events($relativePath: String!) {
    events(relativePath: $relativePath) {
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
      ...EventsParts
    }
  }
  ${EventsPartsFragmentDoc}
`;
export const EventsConnectionDocument = gql`
  query eventsConnection(
    $before: String
    $after: String
    $first: Float
    $last: Float
    $sort: String
    $filter: EventsFilter
  ) {
    eventsConnection(
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
          ...EventsParts
        }
      }
    }
  }
  ${EventsPartsFragmentDoc}
`;
export const ServicesDocument = gql`
  query services($relativePath: String!) {
    services(relativePath: $relativePath) {
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
      ...ServicesParts
    }
  }
  ${ServicesPartsFragmentDoc}
`;
export const ServicesConnectionDocument = gql`
  query servicesConnection(
    $before: String
    $after: String
    $first: Float
    $last: Float
    $sort: String
    $filter: ServicesFilter
  ) {
    servicesConnection(
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
          ...ServicesParts
        }
      }
    }
  }
  ${ServicesPartsFragmentDoc}
`;
export const PortfolioDocument = gql`
  query portfolio($relativePath: String!) {
    portfolio(relativePath: $relativePath) {
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
      ...PortfolioParts
    }
  }
  ${PortfolioPartsFragmentDoc}
`;
export const PortfolioConnectionDocument = gql`
  query portfolioConnection(
    $before: String
    $after: String
    $first: Float
    $last: Float
    $sort: String
    $filter: PortfolioFilter
  ) {
    portfolioConnection(
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
          ...PortfolioParts
        }
      }
    }
  }
  ${PortfolioPartsFragmentDoc}
`;
export const SiteDocument = gql`
  query site($relativePath: String!) {
    site(relativePath: $relativePath) {
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
      ...SiteParts
    }
  }
  ${SitePartsFragmentDoc}
`;
export const SiteConnectionDocument = gql`
  query siteConnection(
    $before: String
    $after: String
    $first: Float
    $last: Float
    $sort: String
    $filter: SiteFilter
  ) {
    siteConnection(
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
          ...SiteParts
        }
      }
    }
  }
  ${SitePartsFragmentDoc}
`;
export function getSdk(requester) {
  return {
    hero(variables, options) {
      return requester(HeroDocument, variables, options);
    },
    heroConnection(variables, options) {
      return requester(HeroConnectionDocument, variables, options);
    },
    events(variables, options) {
      return requester(EventsDocument, variables, options);
    },
    eventsConnection(variables, options) {
      return requester(EventsConnectionDocument, variables, options);
    },
    services(variables, options) {
      return requester(ServicesDocument, variables, options);
    },
    servicesConnection(variables, options) {
      return requester(ServicesConnectionDocument, variables, options);
    },
    portfolio(variables, options) {
      return requester(PortfolioDocument, variables, options);
    },
    portfolioConnection(variables, options) {
      return requester(PortfolioConnectionDocument, variables, options);
    },
    site(variables, options) {
      return requester(SiteDocument, variables, options);
    },
    siteConnection(variables, options) {
      return requester(SiteConnectionDocument, variables, options);
    },
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
    const data = await client.request(
      {
        query: doc,
        variables: vars,
        url,
      },
      options
    );
    return {
      data: data?.data,
      errors: data?.errors,
      query: doc,
      variables: vars || {},
    };
  };
  return requester;
};
export const ExperimentalGetTinaClient = () =>
  getSdk(
    generateRequester(
      createClient({
        url: "http://localhost:4001/graphql",
        queries,
      })
    )
  );
export const queries = (client) => {
  const requester = generateRequester(client);
  return getSdk(requester);
};
