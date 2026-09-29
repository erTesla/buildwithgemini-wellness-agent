# Copyright 2026 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import base64
from unittest.mock import AsyncMock, MagicMock, patch
import pytest

from app.agent import generate_wellness_video


@pytest.mark.asyncio
async def test_generate_wellness_video_success():
    """Tests generate_wellness_video tool with mocked genai and Cloud Storage clients."""
    mock_video_bytes = b"\x00\x00\x00\x18ftypmp42\x00\x00\x00\x00mp42isom"
    mock_b64 = base64.b64encode(mock_video_bytes).decode("utf-8")

    # Mock content and step
    mock_content = MagicMock()
    mock_content.type = "video"
    mock_content.data = mock_b64
    mock_content.mime_type = "video/mp4"

    mock_step = MagicMock()
    mock_step.type = "model_output"
    mock_step.content = [mock_content]

    mock_interaction = MagicMock()
    mock_interaction.steps = [mock_step]

    # Mock tool context
    mock_tool_context = MagicMock()
    mock_tool_context.save_artifact = AsyncMock(return_value=1)

    # Mock genai Client
    with patch("app.agent.genai.Client") as mock_genai_cls, \
         patch("app.agent.storage.Client") as mock_storage_cls:
        
        mock_genai_instance = MagicMock()
        mock_genai_cls.return_value = mock_genai_instance
        mock_genai_instance.interactions.create.return_value = mock_interaction

        mock_storage_instance = MagicMock()
        mock_storage_cls.return_value = mock_storage_instance
        mock_bucket = MagicMock()
        mock_storage_instance.bucket.return_value = mock_bucket
        mock_blob = MagicMock()
        mock_bucket.blob.return_value = mock_blob

        result_url = await generate_wellness_video(
            item_description="Serene morning sunrise over misty pine forest",
            tool_context=mock_tool_context
        )

        # 1. Verify Omni model call in global region
        mock_genai_cls.assert_called_once_with(
            vertexai=True,
            project="qwiklabs-gcp-03-478f309b432f",
            location="global"
        )
        call_kwargs = mock_genai_instance.interactions.create.call_args.kwargs
        assert call_kwargs["model"] == "gemini-omni-flash-preview"

        # 2. Verify save_artifact called with video/mp4 Part
        mock_tool_context.save_artifact.assert_called_once()
        save_args = mock_tool_context.save_artifact.call_args.kwargs
        assert save_args["filename"].startswith("wellness_video_")
        assert save_args["filename"].endswith(".mp4")
        assert save_args["artifact"].inline_data.mime_type == "video/mp4"
        assert save_args["artifact"].inline_data.data == mock_video_bytes

        # 3. Verify Cloud Storage upload
        mock_storage_instance.bucket.assert_called_once_with("bwg3-qwiklabs-gcp-03-478f309b432f")
        mock_blob.upload_from_string.assert_called_once_with(mock_video_bytes, content_type="video/mp4")

        # 4. Verify public URL structure
        expected_url = f"https://storage.googleapis.com/bwg3-qwiklabs-gcp-03-478f309b432f/{save_args['filename']}"
        assert result_url == expected_url
