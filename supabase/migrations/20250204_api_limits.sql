-- APIリクエスト制限を管理するテーブル
CREATE TABLE api_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  requests_count INTEGER DEFAULT 0,
  last_reset TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  daily_limit INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ユーザーが作成されたときに自動的にapi_limitsレコードを作成
CREATE OR REPLACE FUNCTION create_api_limits_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO api_limits (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_api_limits_for_new_user();

-- リクエストカウントをリセットする関数
CREATE OR REPLACE FUNCTION reset_api_requests_if_needed(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE api_limits
  SET requests_count = 0,
      last_reset = CURRENT_TIMESTAMP
  WHERE api_limits.user_id = reset_api_requests_if_needed.user_id
    AND (CURRENT_TIMESTAMP - last_reset) >= INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLSポリシーの設定
ALTER TABLE api_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own limits"
  ON api_limits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can update limits"
  ON api_limits FOR UPDATE
  USING (auth.uid() = user_id);
