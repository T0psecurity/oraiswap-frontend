export default (address: String) => {
  const generate = ({ token, pair }: ListedItem) => {
    return { token, contract: pair, msg: { pool: {} } };
  };

  const query = { parsed: null };
  return query;
};
